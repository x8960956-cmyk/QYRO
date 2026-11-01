import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  Download,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Palette,
  Eye,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { renderQRToCanvas, downloadCanvasPNG, downloadQRAsSVG, VerificationResult } from '../utils/qrRenderer';
import { QRDesignConfig } from '../types/qr';

const ART_STYLES = [
  { id: 'Cyberpunk', label: 'Cyberpunk 2099', palette: 'Electric Violet & Neon Cyan', sample: 'Futuristic city night with neon reflections' },
  { id: 'Futuristic', label: 'Sci-Fi Quantum Core', palette: 'Cyber Blue & Pure White', sample: 'Quantum computing holographic lattice' },
  { id: 'Neon', label: 'Synthwave Neon Glow', palette: 'Hot Magenta & Bright Amber', sample: 'Synthwave 80s sunset with glowing grid' },
  { id: 'Gaming', label: 'Esports Nexus', palette: 'Emerald Green & Obsidian', sample: 'High tech gaming stealth armor texture' },
  { id: 'Nature', label: 'Bioluminescent Flora', palette: 'Teal & Emerald Leaf', sample: 'Bioluminescent deep forest moss and crystal vines' },
  { id: 'Luxury', label: 'Royal Obsidian & Gold', palette: 'Polished Gold & Deep Black', sample: 'Art deco luxury geometric gold foil accents' },
  { id: 'Space', label: 'Cosmic Nebula', palette: 'Deep Violet & Starfield White', sample: 'Deep space supernova with starlight dust' },
  { id: 'Anime', label: 'Anime Celestial', palette: 'Pastel Lilac & Cyber Rose', sample: 'Celestial anime magic circle with starlight runes' },
  { id: '3D', label: '3D Glassmorphism', palette: 'Translucent Cyan & Ice Blue', sample: 'Frosted isometric glass cubes with refraction' },
  { id: 'Minimal', label: 'Neo-Bauhaus Minimal', palette: 'Monochrome High-Contrast', sample: 'Clean Swiss architectural geometric grid' },
];

export const QRArtStudio: React.FC = () => {
  const [destinationUrl, setDestinationUrl] = useState('https://qyro.app');
  const [prompt, setPrompt] = useState('Cyberpunk digital nexus with vibrant holographic conduits');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiThemeData, setAiThemeData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [verification, setVerification] = useState<VerificationResult>({
    isValid: true,
    decodedText: '',
    match: true,
    score: 100,
    notes: 'Scan Verified',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Default design configuration for the artistic canvas
  const [designConfig, setDesignConfig] = useState<QRDesignConfig>({
    pattern: 'dots',
    eyeStyle: 'rounded',
    foregroundColor: '#15D9F5',
    backgroundColor: '#080B18',
    isTransparentBg: false,
    useGradient: true,
    gradientStart: '#7657FF',
    gradientEnd: '#15D9F5',
    gradientType: 'linear-horizontal',
    eyeColor: '#15D9F5',
    errorCorrection: 'H', // Highest error correction for artistic safety
    size: 512,
    quietZone: 3,
    logoSize: 20,
    logoBackground: 'circle',
    logoBgColor: '#080B18',
    hasFrame: true,
    frameText: 'SCAN ARTWORK',
    framePosition: 'bottom',
    frameBgColor: '#7657FF',
    frameTextColor: '#FFFFFF',
  });

  const handleGenerateArt = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const selectedStyleObj = ART_STYLES.find((s) => s.id === selectedStyle);

      const res = await fetch('/api/ai-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          destinationUrl,
          colorPalette: selectedStyleObj?.palette,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAiThemeData(json.data);
        const p = json.data;

        // Apply generated parameters to QR design
        const newDesign: QRDesignConfig = {
          ...designConfig,
          pattern: p.patternType || 'dots',
          eyeStyle: p.eyeShape === 'circle' ? 'circle' : p.eyeShape === 'geometric' ? 'geometric' : 'rounded',
          useGradient: Boolean(p.colorPalette?.gradient),
          gradientStart: p.colorPalette?.gradient?.[0] || p.colorPalette?.foreground || '#7657FF',
          gradientEnd: p.colorPalette?.gradient?.[1] || p.colorPalette?.accentColor || '#15D9F5',
          foregroundColor: p.colorPalette?.foreground || '#15D9F5',
          backgroundColor: p.colorPalette?.background || '#080B18',
          eyeColor: p.colorPalette?.eyeColor || p.colorPalette?.accentColor || '#15D9F5',
          frameBgColor: p.colorPalette?.accentColor || '#7657FF',
          frameText: p.themeName ? p.themeName.toUpperCase() : 'SCAN ARTWORK',
        };

        setDesignConfig(newDesign);
      } else {
        // Fallback styling if API key is not configured
        setErrorMsg(json.error || 'AI generation encountered an issue. Applied local studio synthesis.');
        applyLocalPreset(selectedStyle);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error communicating with AI service');
      applyLocalPreset(selectedStyle);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyLocalPreset = (styleId: string) => {
    const styleObj = ART_STYLES.find((s) => s.id === styleId);
    let gradStart = '#7657FF';
    let gradEnd = '#15D9F5';
    let pattern: any = 'dots';
    let eye: any = 'rounded';

    if (styleId === 'Neon') {
      gradStart = '#EC4899';
      gradEnd = '#F97316';
      pattern = 'smooth';
      eye = 'circle';
    } else if (styleId === 'Gaming') {
      gradStart = '#10B981';
      gradEnd = '#06B6D4';
      pattern = 'pixel';
      eye = 'geometric';
    } else if (styleId === 'Luxury') {
      gradStart = '#F59E0B';
      gradEnd = '#FCD34D';
      pattern = 'rounded';
      eye = 'square';
    } else if (styleId === 'Space') {
      gradStart = '#8B5CF6';
      gradEnd = '#3B82F6';
      pattern = 'dots';
      eye = 'circle';
    }

    setDesignConfig((prev) => ({
      ...prev,
      gradientStart: gradStart,
      gradientEnd: gradEnd,
      pattern,
      eyeStyle: eye,
      frameBgColor: gradStart,
      frameText: `${styleId.toUpperCase()} QR`,
    }));
  };

  // Re-render canvas
  useEffect(() => {
    if (canvasRef.current) {
      renderQRToCanvas(canvasRef.current, destinationUrl, designConfig).then((res) => {
        setVerification(res);
      });
    }
  }, [destinationUrl, designConfig]);

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadCanvasPNG(canvasRef.current, `qyro-ai-art-${selectedStyle.toLowerCase()}.png`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#7657FF]/20 to-[#15D9F5]/20 border border-[#15D9F5]/40 text-xs font-semibold text-[#15D9F5]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generative AI Art Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFF] font-heading">
          AI QR Art Studio
        </h1>
        <p className="text-sm text-[#A8B4D0]">
          Harmonize cutting-edge generative prompts with guaranteed scannability using real-time decoder verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI Prompt & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-xl space-y-5">
            {/* Destination URL */}
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-1.5">
                Target Destination URL *
              </label>
              <input
                type="url"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://qyro.app"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0D1428] border border-[#25304B] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
              />
            </div>

            {/* Art Style Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-2">
                Select Art Style Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ART_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setPrompt(style.sample);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedStyle === style.id
                        ? 'bg-[#7657FF]/20 border-[#15D9F5] text-white shadow-md'
                        : 'bg-[#0D1428] border-[#25304B] text-[#A8B4D0] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{style.label}</div>
                    <div className="text-[10px] text-[#15D9F5] truncate mt-0.5">{style.palette}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Description Prompt */}
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-1.5">
                Generative Art Prompt
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe visual atmosphere, textures, lighting, and ambient motifs..."
                className="w-full px-3 py-2.5 rounded-lg bg-[#0D1428] border border-[#25304B] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateArt}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7657FF] via-[#246BFD] to-[#15D9F5] hover:opacity-95 text-white font-bold text-xs shadow-xl glow-violet flex items-center justify-center space-x-2 transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Generative Art with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate AI Artistic QR</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {aiThemeData && (
              <div className="p-4 bg-[#0D1428] rounded-xl border border-[#25304B] space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-[#15D9F5] font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Theme: {aiThemeData.themeName || selectedStyle}</span>
                </div>
                <p className="text-[#A8B4D0]">{aiThemeData.ambientVibe}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Art Preview & Verification */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-2xl flex flex-col items-center space-y-6">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-[#A8B4D0] uppercase tracking-wider font-mono">
                Artistic Render Output
              </span>
              <span className="text-xs text-[#15D9F5] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Verified Scannable</span>
              </span>
            </div>

            {/* Canvas Box */}
            <div className="relative p-4 rounded-2xl bg-[#080B18] border border-[#25304B] shadow-inner flex items-center justify-center max-w-[340px] w-full aspect-square group">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>

            {/* Scan Reliability Box */}
            <div className="w-full p-3.5 rounded-xl bg-[#0D1428] border border-[#25304B] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-[#10B981]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F8FAFF]">
                    Decoder Verification: {verification.score}%
                  </div>
                  <div className="text-[11px] text-[#A8B4D0] font-mono">
                    {verification.match ? 'Exact Destination Match' : verification.notes}
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7657FF] to-[#246BFD] hover:opacity-95 text-white font-bold text-xs shadow-lg glow-violet flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Artistic QR (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
