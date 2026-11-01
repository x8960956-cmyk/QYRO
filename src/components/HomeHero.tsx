import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Scan,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Palette,
  FileCheck,
  Globe,
  Wifi,
  Contact,
  CreditCard,
  ChevronDown,
  ExternalLink,
  Linkedin
} from 'lucide-react';
import { renderQRToCanvas, downloadCanvasPNG } from '../utils/qrRenderer';
import { QRDesignConfig } from '../types/qr';

interface HomeHeroProps {
  onNavigate: (tab: string, category?: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onNavigate }) => {
  const [heroInput, setHeroInput] = useState('https://qyro.app/explore');
  const [heroStyle, setHeroStyle] = useState<'cyber' | 'emerald' | 'sunset' | 'gold'>('cyber');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);

  const styleConfigs: Record<string, Partial<QRDesignConfig>> = {
    cyber: {
      pattern: 'dots',
      eyeStyle: 'rounded',
      useGradient: true,
      gradientStart: '#7657FF',
      gradientEnd: '#15D9F5',
      eyeColor: '#15D9F5',
      backgroundColor: '#080B18',
      hasFrame: true,
      frameText: 'SCAN ME',
      frameBgColor: '#7657FF',
    },
    emerald: {
      pattern: 'smooth',
      eyeStyle: 'circle',
      useGradient: true,
      gradientStart: '#10B981',
      gradientEnd: '#06B6D4',
      eyeColor: '#10B981',
      backgroundColor: '#080B18',
      hasFrame: true,
      frameText: 'CONNECT NOW',
      frameBgColor: '#10B981',
    },
    sunset: {
      pattern: 'rounded',
      eyeStyle: 'circle',
      useGradient: true,
      gradientStart: '#EC4899',
      gradientEnd: '#F97316',
      eyeColor: '#EC4899',
      backgroundColor: '#080B18',
      hasFrame: true,
      frameText: 'DISCOVER',
      frameBgColor: '#EC4899',
    },
    gold: {
      pattern: 'pixel',
      eyeStyle: 'geometric',
      useGradient: true,
      gradientStart: '#F59E0B',
      gradientEnd: '#FCD34D',
      eyeColor: '#F59E0B',
      backgroundColor: '#080B18',
      hasFrame: true,
      frameText: 'VIP ACCESS',
      frameBgColor: '#F59E0B',
    },
  };

  useEffect(() => {
    if (heroCanvasRef.current) {
      const activeCfg: QRDesignConfig = {
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
        errorCorrection: 'Q',
        size: 380,
        quietZone: 3,
        logoSize: 20,
        logoBackground: 'circle',
        logoBgColor: '#080B18',
        hasFrame: true,
        frameText: 'SCAN ME',
        framePosition: 'bottom',
        frameBgColor: '#7657FF',
        frameTextColor: '#FFFFFF',
        ...styleConfigs[heroStyle],
      };
      renderQRToCanvas(heroCanvasRef.current, heroInput, activeCfg);
    }
  }, [heroInput, heroStyle]);

  const faqs = [
    {
      q: 'Do QYRO static QR codes ever expire?',
      a: 'No. Static QR codes encode your data directly into the pixel pattern. They will continue to work indefinitely without any recurring fees or account requirements.',
    },
    {
      q: 'What is the difference between static and dynamic QR codes?',
      a: 'Static QR codes encode the data directly and cannot be modified once generated. Dynamic QR codes point to a high-speed QYRO redirect URL, allowing you to edit the destination anytime without changing the printed code, while tracking scan analytics.',
    },
    {
      q: 'Does QYRO support international scripts and Tamil language?',
      a: 'Yes. QYRO uses byte-mode UTF-8 encoding that strictly preserves Unicode text, line breaks, punctuation, and scripts including Tamil (தமிழ்), Hindi, Japanese, Arabic, and emojis without truncation.',
    },
    {
      q: 'Can I add my company logo without breaking scan reliability?',
      a: 'Yes. QYRO includes an automatic High Error Correction (30% recovery) engine and an independent real-time jsQR verifier that tests pixel readability directly on your canvas before you download.',
    },
    {
      q: 'Can I download vector formats for print production?',
      a: 'Yes. You can export crystal-clear PNGs up to 2048x2048px, scalable vector SVGs for print houses, and ready-to-print A4 PDF documents.',
    },
  ];

  return (
    <div className="space-y-24 pb-16 animate-fadeIn">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 pb-12">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#7657FF]/20 via-[#246BFD]/15 to-[#15D9F5]/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & Interactive Quick Input */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#111A31] border border-[#25304B] text-xs font-semibold text-[#15D9F5] shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#15D9F5] animate-ping" />
                <span>Next-Generation Universal QR Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#F8FAFF] tracking-tight font-heading leading-[1.1]">
                Your World. <br />
                <span className="bg-gradient-to-r from-[#15D9F5] via-[#246BFD] to-[#7657FF] bg-clip-text text-transparent">
                  One Scan.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#A8B4D0] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Create, customize, and share QR codes for everything. From websites and contacts to businesses, products, and creative designs.
              </p>

              {/* Live Interactive Hero Input */}
              <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-3 shadow-xl max-w-lg mx-auto lg:mx-0 space-y-3">
                <div className="flex rounded-xl overflow-hidden border border-[#25304B] bg-[#080B18]">
                  <input
                    type="text"
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    placeholder="Enter any URL or message to test live..."
                    className="w-full px-3.5 py-2.5 bg-transparent text-xs text-[#F8FAFF] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#A8B4D0]">Select Style Palette:</span>
                  <div className="flex space-x-1.5">
                    {[
                      { id: 'cyber', label: 'Cyber', color: '#15D9F5' },
                      { id: 'emerald', label: 'Emerald', color: '#10B981' },
                      { id: 'sunset', label: 'Sunset', color: '#EC4899' },
                      { id: 'gold', label: 'Gold', color: '#F59E0B' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setHeroStyle(s.id as any)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                          heroStyle === s.id
                            ? 'border-white text-white bg-white/10'
                            : 'border-[#25304B] text-[#A8B4D0]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('generator')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#7657FF] via-[#246BFD] to-[#15D9F5] hover:opacity-95 text-white font-bold text-sm shadow-xl glow-violet flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Create QR Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('scanner')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#111A31] hover:bg-[#1A2646] text-[#F8FAFF] border border-[#25304B] font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <Scan className="w-4 h-4 text-[#15D9F5]" />
                  <span>Scan QR Code</span>
                </button>
              </div>

              {/* Micro feature badges */}
              <div className="flex items-center justify-center lg:justify-start space-x-6 pt-4 text-xs text-[#A8B4D0]">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>100% Free Static QRs</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>No Truncation</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Vector & PNG Export</span>
                </span>
              </div>
            </div>

            {/* Right Column: Live Interactive Interactive QR Canvas */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative p-6 rounded-3xl bg-[#111A31] border border-[#25304B] shadow-2xl flex flex-col items-center max-w-[380px] w-full space-y-4">
                <div className="w-full flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-[#10B981] font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Real-Time Decoded</span>
                  </div>
                  <span className="text-[#A8B4D0] font-mono text-[10px]">
                    Tested with Phone Scanners
                  </span>
                </div>

                <div className="p-3 bg-[#080B18] rounded-2xl border border-[#25304B] shadow-inner flex items-center justify-center aspect-square w-full">
                  <canvas ref={heroCanvasRef} className="max-w-full max-h-full object-contain rounded-lg" />
                </div>

                <button
                  onClick={() => onNavigate('generator')}
                  className="w-full py-2.5 rounded-xl bg-[#0D1428] hover:bg-[#1A2646] text-[#15D9F5] border border-[#25304B] text-xs font-bold transition-all text-center"
                >
                  Open in Universal Studio →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFF] font-heading">
            Universal QR Categories
          </h2>
          <p className="text-sm text-[#A8B4D0]">
            Every category features a tailored input form and standardized protocol payload.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'url', label: 'Website URL', icon: Globe, desc: 'HTTPS parameter support' },
            { id: 'text', label: 'Plain Text', icon: Globe, desc: 'Unicode & Tamil support' },
            { id: 'vcard', label: 'Contact Card', icon: Contact, desc: 'Standard vCard 3.0' },
            { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi, desc: 'WPA/WPA3 & Hidden' },
            { id: 'payment', label: 'Payment Link', icon: CreditCard, desc: 'UPI & Crypto' },
            { id: 'file-pdf', label: 'PDF Documents', icon: FileCheck, desc: 'Cloud hosted link' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate('generator', item.id)}
                className="p-4 rounded-2xl bg-[#111A31] border border-[#25304B] hover:border-[#15D9F5] cursor-pointer transition-all hover:-translate-y-1 group space-y-2 text-center flex flex-col items-center justify-center"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0D1428] border border-[#25304B] flex items-center justify-center text-[#15D9F5] group-hover:bg-[#7657FF] group-hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#F8FAFF]">{item.label}</div>
                <div className="text-[10px] text-[#A8B4D0]">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CORE PLATFORM CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFF] font-heading">
            Built for Extreme Reliability
          </h2>
          <p className="text-sm text-[#A8B4D0]">
            Advanced features engineered for personal creators, enterprise marketers, and developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111A31] border border-[#25304B] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7657FF]/20 border border-[#7657FF]/50 flex items-center justify-center text-[#15D9F5]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFF] font-heading">
              Dynamic QR Codes & Analytics
            </h3>
            <p className="text-xs text-[#A8B4D0] leading-relaxed">
              Printed on packaging or flyers? Update destinations anytime via server redirects without re-printing. Monitor scans, mobile vs desktop breakdown, and browsers.
            </p>
            <button
              onClick={() => onNavigate('dynamic')}
              className="text-xs text-[#15D9F5] font-bold flex items-center space-x-1 hover:underline"
            >
              <span>Explore Dynamic QRs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#111A31] border border-[#25304B] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#246BFD]/20 border border-[#246BFD]/50 flex items-center justify-center text-[#15D9F5]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFF] font-heading">
              AI QR Art Studio
            </h3>
            <p className="text-xs text-[#A8B4D0] leading-relaxed">
              Synthesize cyberpunk, synthwave, anime, and luxury artistic themes with Gemini AI while strictly preserving barcode finder patterns and guaranteed scan scannability.
            </p>
            <button
              onClick={() => onNavigate('art-studio')}
              className="text-xs text-[#15D9F5] font-bold flex items-center space-x-1 hover:underline"
            >
              <span>Open Art Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#111A31] border border-[#25304B] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/50 flex items-center justify-center text-[#10B981]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F8FAFF] font-heading">
              Bulk CSV Generation & ZIP Export
            </h3>
            <p className="text-xs text-[#A8B4D0] leading-relaxed">
              Upload spreadsheets with hundreds of URLs or employee names. Generate branded QR codes in parallel and download everything bundled in a single ZIP archive.
            </p>
            <button
              onClick={() => onNavigate('bulk')}
              className="text-xs text-[#15D9F5] font-bold flex items-center space-x-1 hover:underline"
            >
              <span>Launch Bulk Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOUNDER SPOTLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-10 border border-[#25304B] bg-gradient-to-r from-[#111A31] via-[#0D1428] to-[#111A31] shadow-2xl overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#7657FF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#15D9F5]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#15D9F5]/10 border border-[#15D9F5]/30 text-xs font-semibold text-[#15D9F5]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Founder Spotlight</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFF] font-heading flex flex-wrap items-center gap-3">
                <span>Founded by Dhivya Rajendran</span>
                <a
                  href="https://www.linkedin.com/in/dhivya-r-28628040b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#246BFD]/15 hover:bg-[#246BFD]/30 border border-[#246BFD]/40 text-[#15D9F5] text-xs font-semibold transition-all hover:scale-105"
                  title="View Dhivya Rajendran on LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </h2>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <span className="px-3 py-1 rounded-full bg-[#7657FF]/20 border border-[#7657FF]/40 text-xs font-bold text-[#F8FAFF]">
                  Creator & Platform Architect
                </span>
                <span className="px-3 py-1 rounded-full bg-[#246BFD]/20 border border-[#246BFD]/40 text-xs font-bold text-[#15D9F5]">
                  Class 11th PCMB (Bio-Maths)
                </span>
                <span className="px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-xs font-bold text-[#10B981]">
                  Physics · Chemistry · Mathematics · Biology
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#A8B4D0] leading-relaxed pt-2">
                "QYRO was born from a vision to build a clean, genuinely universal QR platform for students, educators, creators, and businesses worldwide. Free forever, engineered with 100% UTF-8 Unicode precision, real-time camera scanning, and cutting-edge AI design."
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center space-y-3">
              <a
                href="https://www.linkedin.com/in/dhivya-r-28628040b/"
                target="_blank"
                rel="noopener noreferrer"
                title="Connect with Dhivya Rajendran on LinkedIn (Opens in new tab)"
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#7657FF] via-[#246BFD] to-[#15D9F5] p-[2.5px] shadow-2xl glow-violet group block transition-transform hover:scale-105 cursor-pointer"
              >
                <img
                  src="/assets/aistudio/Screenshot_2026-10-10_195139_c8af0110.png"
                  alt="Dhivya Rajendran - Founder of QYRO"
                  className="w-full h-full object-cover rounded-full bg-[#080B18]"
                />
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#080B18] border border-[#15D9F5] text-[#15D9F5] text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap shadow-md group-hover:bg-[#15D9F5] group-hover:text-black transition-colors flex items-center space-x-1">
                  <span>Dhivya R. · Founder</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>

              <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                <a
                  href="https://www.linkedin.com/in/dhivya-r-28628040b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#246BFD]/25 to-[#7657FF]/25 hover:from-[#246BFD]/40 hover:to-[#7657FF]/40 text-[#15D9F5] hover:text-white border border-[#246BFD]/50 text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>Connect</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  onClick={() => onNavigate('templates')}
                  className="px-3.5 py-2 rounded-xl bg-[#0D1428] hover:bg-[#1A2646] text-[#A8B4D0] hover:text-[#F8FAFF] border border-[#25304B] text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <span>Founder Card</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFF] font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#A8B4D0]">
            Everything you need to know about QR generation, encoding standards, and security.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#111A31] border border-[#25304B] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm font-bold text-[#F8FAFF]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#15D9F5] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-[#A8B4D0] leading-relaxed border-t border-[#25304B]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#25304B] pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-[#A8B4D0] space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7657FF] to-[#15D9F5] flex items-center justify-center font-bold text-black text-xs">
                Q
              </div>
              <span className="font-extrabold text-sm text-[#F8FAFF]">QYRO</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Universal QR Code Generator, Scanner & AI Design Platform. Scan Different. Connect Everything.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#F8FAFF] uppercase tracking-wider mb-2 text-[11px]">
              Generation Tools
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => onNavigate('generator', 'url')} className="hover:text-white">Website to QR</button></li>
              <li><button onClick={() => onNavigate('generator', 'text')} className="hover:text-white">Text & Tamil QR</button></li>
              <li><button onClick={() => onNavigate('generator', 'vcard')} className="hover:text-white">Contact vCard QR</button></li>
              <li><button onClick={() => onNavigate('generator', 'wifi')} className="hover:text-white">Wi-Fi Network QR</button></li>
              <li><button onClick={() => onNavigate('generator', 'payment')} className="hover:text-white">Payment & UPI QR</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#F8FAFF] uppercase tracking-wider mb-2 text-[11px]">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => onNavigate('scanner')} className="hover:text-white">High-Speed Scanner</button></li>
              <li><button onClick={() => onNavigate('art-studio')} className="hover:text-white">AI Art Studio</button></li>
              <li><button onClick={() => onNavigate('dynamic')} className="hover:text-white">Dynamic Routing</button></li>
              <li><button onClick={() => onNavigate('bulk')} className="hover:text-white">Bulk CSV Generator</button></li>
              <li><button onClick={() => onNavigate('templates')} className="hover:text-white">Design Templates</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#F8FAFF] uppercase tracking-wider mb-2 text-[11px]">
              Security & Privacy
            </h4>
            <p className="text-[11px] leading-relaxed">
              Client-side verification with jsQR. No silent redirects. Standard RFC vCard and UTF-8 encoding compliance.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#25304B]/50 flex flex-col sm:flex-row items-center justify-between text-[11px]">
          <span>© {new Date().getFullYear()} QYRO. Founded by <a href="https://www.linkedin.com/in/dhivya-r-28628040b/" target="_blank" rel="noopener noreferrer" className="text-[#15D9F5] hover:underline font-bold inline-flex items-center space-x-1"><span>Dhivya Rajendran</span><ExternalLink className="w-2.5 h-2.5 inline ml-0.5" /></a> · Class 11th PCMB (Bio-Maths).</span>
          <span className="mt-2 sm:mt-0 font-mono text-[#15D9F5]">
            Scan Different. Connect Everything.
          </span>
        </div>
      </footer>
    </div>
  );
};
