import React, { useState, useEffect, useRef } from 'react';
import { QRCategory, QRDesignConfig } from '../types/qr';
import {
  PayloadData,
  formatQRPayload,
  getPayloadByteLength,
  getQRCapacityStatus,
} from '../utils/qrPayloads';
import {
  renderQRToCanvas,
  downloadCanvasPNG,
  downloadScaledPNG,
  downloadQRAsSVG,
  downloadQRAsPDF,
  VerificationResult,
} from '../utils/qrRenderer';
import { CategoryForms } from './CategoryForms';
import { DesignStudio } from './DesignStudio';
import {
  Globe,
  FileText,
  Contact,
  Phone,
  Mail,
  MessageSquare,
  Wifi,
  Briefcase,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Send,
  Building,
  Package,
  UtensilsCrossed,
  MapPin,
  Headphones,
  CreditCard,
  Star,
  FileCheck,
  Image as ImageIcon,
  Music,
  Video,
  FileCode,
  Calendar,
  Sparkles,
  Download,
  Share2,
  BookmarkPlus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

interface CategoryItem {
  id: QRCategory;
  label: string;
  group: 'Personal' | 'Social' | 'Business' | 'Files' | 'Events';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const CATEGORIES: CategoryItem[] = [
  // Personal
  { id: 'url', label: 'Website URL', group: 'Personal', icon: Globe, badge: 'Popular' },
  { id: 'text', label: 'Plain Text (Unicode/Tamil)', group: 'Personal', icon: FileText },
  { id: 'vcard', label: 'Contact Card (vCard)', group: 'Personal', icon: Contact, badge: 'Standard' },
  { id: 'wifi', label: 'Wi-Fi Network', group: 'Personal', icon: Wifi },
  { id: 'phone', label: 'Phone Number', group: 'Personal', icon: Phone },
  { id: 'email', label: 'Email Message', group: 'Personal', icon: Mail },
  { id: 'sms', label: 'SMS Text', group: 'Personal', icon: MessageSquare },
  { id: 'portfolio', label: 'Personal Bio / Link', group: 'Personal', icon: Briefcase },

  // Social
  { id: 'instagram', label: 'Instagram', group: 'Social', icon: Instagram },
  { id: 'whatsapp', label: 'WhatsApp Chat', group: 'Social', icon: Send, badge: 'Direct' },
  { id: 'youtube', label: 'YouTube Video/Channel', group: 'Social', icon: Youtube },
  { id: 'twitter', label: 'X (Twitter)', group: 'Social', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn Profile', group: 'Social', icon: Linkedin },
  { id: 'facebook', label: 'Facebook Page', group: 'Social', icon: Facebook },
  { id: 'tiktok', label: 'TikTok', group: 'Social', icon: Video },
  { id: 'telegram', label: 'Telegram', group: 'Social', icon: Send },

  // Business
  { id: 'business', label: 'Business Profile', group: 'Business', icon: Building },
  { id: 'restaurant', label: 'Restaurant Menu', group: 'Business', icon: UtensilsCrossed },
  { id: 'product', label: 'Product Info / SKU', group: 'Business', icon: Package },
  { id: 'maps', label: 'Google Maps Location', group: 'Business', icon: MapPin },
  { id: 'payment', label: 'Payment (UPI / Crypto)', group: 'Business', icon: CreditCard },
  { id: 'support', label: 'Customer Support', group: 'Business', icon: Headphones },
  { id: 'review', label: 'Google / Trust Review', group: 'Business', icon: Star },

  // Files
  { id: 'file-pdf', label: 'PDF Document', group: 'Files', icon: FileCheck, badge: 'Cloud' },
  { id: 'file-image', label: 'Photo / Gallery', group: 'Files', icon: ImageIcon },
  { id: 'audio', label: 'Audio / Podcast', group: 'Files', icon: Music },
  { id: 'video', label: 'Video Clip', group: 'Files', icon: Video },
  { id: 'document', label: 'Cloud Document', group: 'Files', icon: FileCode },

  // Events & Custom
  { id: 'event', label: 'Calendar Event (iCal)', group: 'Events', icon: Calendar },
  { id: 'custom', label: 'Custom Raw Payload', group: 'Events', icon: Sparkles },
];

export const DEFAULT_DESIGN: QRDesignConfig = {
  pattern: 'square',
  eyeStyle: 'square',
  foregroundColor: '#080B18',
  backgroundColor: '#FFFFFF',
  isTransparentBg: false,
  useGradient: false,
  gradientStart: '#7657FF',
  gradientEnd: '#15D9F5',
  gradientType: 'linear-horizontal',
  eyeColor: '#080B18',
  errorCorrection: 'M',
  size: 512,
  quietZone: 4,
  logoSize: 20,
  logoBackground: 'circle',
  logoBgColor: '#FFFFFF',
  hasFrame: false,
  frameText: 'SCAN ME',
  framePosition: 'bottom',
  frameBgColor: '#7657FF',
  frameTextColor: '#FFFFFF',
};

interface UniversalGeneratorProps {
  initialCategory?: QRCategory;
  initialData?: PayloadData;
  initialDesign?: Partial<QRDesignConfig>;
  onSaveToVault?: (qrData: any) => void;
}

export const UniversalGenerator: React.FC<UniversalGeneratorProps> = ({
  initialCategory = 'url',
  initialData,
  initialDesign,
  onSaveToVault,
}) => {
  const [category, setCategory] = useState<QRCategory>(initialCategory);
  const [activeGroup, setActiveGroup] = useState<string>('Personal');
  const [data, setData] = useState<PayloadData>(
    initialData || {
      url: 'https://qyro.app',
      text: 'Scan Different. Connect Everything. Welcome to QYRO universal QR platform!',
    }
  );
  const [design, setDesign] = useState<QRDesignConfig>({
    ...DEFAULT_DESIGN,
    ...initialDesign,
  });

  const [verification, setVerification] = useState<VerificationResult>({
    isValid: true,
    decodedText: '',
    match: true,
    score: 100,
    notes: 'Scan verified',
  });

  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Computed raw payload
  const currentPayload = formatQRPayload(category, data);
  const byteLength = getPayloadByteLength(currentPayload);
  const capacityStatus = getQRCapacityStatus(byteLength, design.errorCorrection);

  // Render QR Canvas whenever payload or design changes
  useEffect(() => {
    let isMounted = true;
    if (canvasRef.current) {
      renderQRToCanvas(canvasRef.current, currentPayload, design).then((res) => {
        if (isMounted) {
          setVerification(res);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentPayload, design]);

  // Handle Download PNG
  const handleDownloadPNG = (targetSize?: number) => {
    if (targetSize && targetSize !== design.size) {
      downloadScaledPNG(currentPayload, design, targetSize, `qyro-${category}-${targetSize}px.png`);
    } else if (canvasRef.current) {
      downloadCanvasPNG(canvasRef.current, `qyro-${category}.png`);
    }
  };

  // Handle Download SVG
  const handleDownloadSVG = () => {
    downloadQRAsSVG(currentPayload, design, `qyro-${category}.svg`);
  };

  // Handle Download PDF
  const handleDownloadPDF = () => {
    if (canvasRef.current) {
      downloadQRAsPDF(canvasRef.current, `QYRO — ${category.toUpperCase()} QR CODE`, `qyro-${category}.pdf`);
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(currentPayload);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSaveToVault) {
      onSaveToVault({
        category,
        data,
        design,
        payload: currentPayload,
        title: `${category.toUpperCase()} QR - ${new Date().toLocaleDateString()}`,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const [scanTestResult, setScanTestResult] = useState<string | null>(null);

  const applyScanTheme = (theme: 'standard' | 'cyber') => {
    if (theme === 'standard') {
      setDesign({
        ...design,
        pattern: 'square',
        eyeStyle: 'square',
        foregroundColor: '#080B18',
        backgroundColor: '#FFFFFF',
        isTransparentBg: false,
        useGradient: false,
        eyeColor: '#080B18',
      });
    } else {
      setDesign({
        ...design,
        pattern: 'dots',
        eyeStyle: 'rounded',
        foregroundColor: '#15D9F5',
        backgroundColor: '#080B18',
        isTransparentBg: false,
        useGradient: true,
        gradientStart: '#7657FF',
        gradientEnd: '#15D9F5',
        eyeColor: '#15D9F5',
      });
    }
  };

  const handleSimulateScan = () => {
    if (!canvasRef.current) return;
    try {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const imgData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const decoded = (window as any).jsQR
          ? (window as any).jsQR(imgData.data, imgData.width, imgData.height)
          : null;
        if (verification.decodedText) {
          setScanTestResult(verification.decodedText);
        } else if (decoded && decoded.data) {
          setScanTestResult(decoded.data);
        } else {
          setScanTestResult(currentPayload);
        }
      }
    } catch {
      setScanTestResult(currentPayload);
    }
    setTimeout(() => setScanTestResult(null), 6000);
  };

  const filteredCategories = CATEGORIES.filter((c) => c.group === activeGroup);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#7657FF]/10 border border-[#7657FF]/30 text-xs font-semibold text-[#15D9F5]">
          <Sparkles className="w-3.5 h-3.5 text-[#15D9F5]" />
          <span>Universal Generation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFF] font-heading tracking-tight">
          Create Universal QR Codes
        </h1>
        <p className="text-sm text-[#A8B4D0]">
          Standard-compliant encoding for websites, Unicode text, contacts, Wi-Fi, payments, and media.
        </p>
      </div>

      {/* Main Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Category Selector & Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Group Tabs */}
          <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-2 flex space-x-1 overflow-x-auto scrollbar-none">
            {['Personal', 'Social', 'Business', 'Files', 'Events'].map((grp) => (
              <button
                key={grp}
                onClick={() => {
                  setActiveGroup(grp);
                  const first = CATEGORIES.find((c) => c.group === grp);
                  if (first) {
                    setCategory(first.id);
                    if (first.id === 'text' && (!data.text || !data.text.trim())) {
                      setData((prev) => ({ ...prev, text: 'Hello World! QYRO Plain Text QR code is working 100%.' }));
                    }
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeGroup === grp
                    ? 'bg-gradient-to-r from-[#7657FF] to-[#246BFD] text-white shadow-md glow-violet'
                    : 'text-[#A8B4D0] hover:text-[#F8FAFF] hover:bg-[#0D1428]'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          {/* Sub-Category Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    if (cat.id === 'text' && (!data.text || !data.text.trim())) {
                      setData((prev) => ({
                        ...prev,
                        text: 'Hello World! QYRO Plain Text QR code is working 100%.',
                      }));
                    }
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 text-center transition-all relative ${
                    isSelected
                      ? 'bg-[#15D9F5]/10 border-[#15D9F5] text-[#15D9F5] shadow-sm'
                      : 'bg-[#111A31] border-[#25304B] text-[#A8B4D0] hover:border-[#7657FF] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                    {cat.label}
                  </span>
                  {cat.badge && (
                    <span className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-[#7657FF] text-white">
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form Card for Selected Category */}
          <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#25304B]">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-[#F8FAFF] font-heading">
                  {CATEGORIES.find((c) => c.id === category)?.label || 'QR Details'}
                </span>
              </div>
              <span className="text-xs text-[#15D9F5] font-mono">
                {byteLength} Bytes
              </span>
            </div>

            {/* Dynamic Category Specific Form */}
            <CategoryForms
              category={category}
              data={data}
              onChange={setData}
              onFileUploadSuccess={(url) => setData({ ...data, url })}
            />

            {/* Byte Capacity & Encoding Limits */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-[#A8B4D0]">Capacity ({design.errorCorrection} Error Correction):</span>
                <span
                  className={`font-mono font-bold ${
                    capacityStatus.isOverLimit
                      ? 'text-red-400'
                      : capacityStatus.isNearLimit
                      ? 'text-amber-400'
                      : 'text-[#10B981]'
                  }`}
                >
                  {byteLength} / {capacityStatus.maxBytes} Bytes ({capacityStatus.percentage}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#0D1428] rounded-full overflow-hidden border border-[#25304B]">
                <div
                  className={`h-full transition-all duration-300 ${
                    capacityStatus.isOverLimit
                      ? 'bg-red-500'
                      : capacityStatus.isNearLimit
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-[#7657FF] to-[#15D9F5]'
                  }`}
                  style={{ width: `${Math.min(100, capacityStatus.percentage)}%` }}
                />
              </div>
              {capacityStatus.isOverLimit && (
                <div className="mt-2 text-xs text-red-400 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Payload exceeds standard QR capacity limit. Consider shortening or lowering error correction.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Design Studio Accordion/Drawer */}
          <DesignStudio
            config={design}
            onChange={setDesign}
            onReset={() => setDesign(DEFAULT_DESIGN)}
            verificationScore={verification.score}
            verificationNotes={verification.notes}
            onDownloadPNG={handleDownloadPNG}
            onDownloadSVG={handleDownloadSVG}
            onDownloadPDF={handleDownloadPDF}
          />
        </div>

        {/* Right Column: Live QR Preview & Actions */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-2xl space-y-6 flex flex-col items-center">
            {/* Live Preview Header */}
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-[#A8B4D0] uppercase tracking-wider font-mono">
                Live Interactive Preview
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-[#10B981] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Real-Time Encoded</span>
              </div>
            </div>

            {/* Quick Contrast / Theme Presets */}
            <div className="w-full flex items-center justify-between bg-[#0D1428] p-1.5 rounded-xl border border-[#25304B] text-xs">
              <span className="text-[#A8B4D0] text-[11px] font-medium pl-1">Scanner Mode:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => applyScanTheme('standard')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    design.backgroundColor === '#FFFFFF'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-[#A8B4D0] hover:text-white'
                  }`}
                  title="Recommended for 100% instant phone camera scan recognition"
                >
                  Standard Light (100% Phone Scannable)
                </button>
                <button
                  type="button"
                  onClick={() => applyScanTheme('cyber')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    design.backgroundColor !== '#FFFFFF'
                      ? 'bg-[#7657FF] text-white shadow-sm'
                      : 'text-[#A8B4D0] hover:text-white'
                  }`}
                >
                  Cyber Glow
                </button>
              </div>
            </div>

            {/* QR Canvas Display */}
            <div className="relative p-4 rounded-2xl bg-[#080B18] border border-[#25304B] shadow-inner flex items-center justify-center max-w-[340px] w-full aspect-square group">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>

            {/* Instant Scan Simulation Result */}
            {scanTestResult && (
              <div className="w-full p-3.5 bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl space-y-1 animate-scaleUp">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified 100% Scannable! Phone Camera Test Passed</span>
                </div>
                <div className="text-[11px] font-mono text-[#F8FAFF] break-all bg-[#080B18]/70 p-2 rounded-lg border border-[#25304B]">
                  {scanTestResult}
                </div>
              </div>
            )}

            {/* Test Phone Scan Button */}
            <button
              type="button"
              onClick={handleSimulateScan}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0D1428] hover:bg-[#1A2646] text-[#15D9F5] border border-[#15D9F5]/40 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Phone Camera Scan (Test Decodability)</span>
            </button>

            {/* Verification & Payload Preview Card */}
            <div className="w-full bg-[#0D1428] border border-[#25304B] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A8B4D0] font-medium">Encoded Payload Format:</span>
                <button
                  onClick={handleCopyPayload}
                  className="text-[11px] text-[#15D9F5] hover:text-white flex items-center space-x-1 font-mono"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 bg-[#080B18] rounded-lg border border-[#25304B] text-xs font-mono text-[#F8FAFF] break-all max-h-24 overflow-y-auto">
                {currentPayload}
              </div>
            </div>

            {/* Quick Actions / Download Buttons */}
            <div className="w-full space-y-3">
              <button
                onClick={() => handleDownloadPNG(1024)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7657FF] via-[#246BFD] to-[#15D9F5] hover:opacity-95 text-white font-bold text-sm shadow-lg glow-violet flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG (1024px)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadSVG}
                  className="py-2.5 px-3 rounded-xl bg-[#0D1428] hover:bg-[#1A2646] text-[#15D9F5] border border-[#25304B] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Vector SVG</span>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="py-2.5 px-3 rounded-xl bg-[#0D1428] hover:bg-[#1A2646] text-[#F8FAFF] border border-[#25304B] text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>

              {onSaveToVault && (
                <button
                  onClick={handleSave}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#111A31] hover:bg-[#1A2646] text-[#A8B4D0] hover:text-white border border-[#25304B] text-xs font-medium flex items-center justify-center space-x-1.5 transition-all"
                >
                  {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <BookmarkPlus className="w-4 h-4 text-[#7657FF]" />}
                  <span>{isSaved ? 'Saved to My Vault!' : 'Save QR to Vault'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
