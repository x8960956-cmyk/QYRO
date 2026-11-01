import React, { useRef, useState } from 'react';
import { QRDesignConfig, PatternStyle, EyeStyle, ErrorCorrectionLevel } from '../types/qr';
import {
  Palette,
  Image as ImageIcon,
  Square,
  Circle,
  Sparkles,
  Download,
  FileCheck,
  ShieldAlert,
  Sliders,
  Type,
  Maximize2,
  RefreshCw,
  Eye,
  Check,
  X
} from 'lucide-react';

interface DesignStudioProps {
  config: QRDesignConfig;
  onChange: (newConfig: QRDesignConfig) => void;
  onReset: () => void;
  verificationScore: number;
  verificationNotes: string;
  onDownloadPNG: (size?: number) => void;
  onDownloadSVG: () => void;
  onDownloadPDF: () => void;
}

export const DesignStudio: React.FC<DesignStudioProps> = ({
  config,
  onChange,
  onReset,
  verificationScore,
  verificationNotes,
  onDownloadPNG,
  onDownloadSVG,
  onDownloadPDF,
}) => {
  const [activeTab, setActiveTab] = useState<'patterns' | 'colors' | 'logo' | 'frame' | 'export'>('patterns');
  const [selectedHiRes, setSelectedHiRes] = useState<number>(1024);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<QRDesignConfig>) => {
    onChange({ ...config, ...partial });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Automatically switch error correction to H for logo safety
        update({
          logoUrl: reader.result as string,
          errorCorrection: 'H',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const colorPresets = [
    { name: 'Neon Cyber', start: '#7657FF', end: '#15D9F5', bg: '#080B18' },
    { name: 'Electric Violet', start: '#7657FF', end: '#246BFD', bg: '#080B18' },
    { name: 'Emerald Matrix', start: '#10B981', end: '#06B6D4', bg: '#080B18' },
    { name: 'Sunset Glow', start: '#EC4899', end: '#F97316', bg: '#080B18' },
    { name: 'Royal Gold', start: '#F59E0B', end: '#FCD34D', bg: '#0D1428' },
    { name: 'Clean Light', start: '#111A31', end: '#246BFD', bg: '#F8FAFF' },
  ];

  const logoPresets = [
    { name: 'QYRO Diamond', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%237657FF"/><polygon points="50,20 80,50 50,80 20,50" fill="%2315D9F5"/></svg>' },
    { name: 'Sparkle AI', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23111A31"/><path d="M50 15 L58 42 L85 50 L58 58 L50 85 L42 58 L15 50 L42 42 Z" fill="%2315D9F5"/></svg>' },
    { name: 'Web Link', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23246BFD"/><circle cx="50" cy="50" r="26" fill="none" stroke="white" stroke-width="8"/><line x1="20" y1="50" x2="80" y2="50" stroke="white" stroke-width="8"/></svg>' },
  ];

  return (
    <div className="bg-[#111A31] border border-[#25304B] rounded-2xl overflow-hidden shadow-xl">
      {/* Studio Navigation Bar */}
      <div className="flex border-b border-[#25304B] bg-[#0D1428] overflow-x-auto scrollbar-none">
        {[
          { id: 'patterns', label: 'Shapes & Eyes', icon: Sliders },
          { id: 'colors', label: 'Colors & Glow', icon: Palette },
          { id: 'logo', label: 'Logo & Center', icon: ImageIcon },
          { id: 'frame', label: 'Frames & Badges', icon: Type },
          { id: 'export', label: 'Export & Print', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-[#15D9F5] text-[#15D9F5] bg-[#111A31]'
                  : 'border-transparent text-[#A8B4D0] hover:text-[#F8FAFF]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* TAB 1: SHAPES & EYES */}
        {activeTab === 'patterns' && (
          <div className="space-y-5">
            {/* Pattern Styles */}
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-2">
                Module Pattern Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'square', label: 'Square' },
                  { id: 'rounded', label: 'Rounded' },
                  { id: 'dots', label: 'Dots' },
                  { id: 'smooth', label: 'Smooth' },
                  { id: 'pixel', label: 'Pixel' },
                  { id: 'geometric', label: 'Geometric' },
                  { id: 'minimal', label: 'Minimal' },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => update({ pattern: pat.id as PatternStyle })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      config.pattern === pat.id
                        ? 'bg-[#7657FF] text-white border-[#7657FF] shadow-sm'
                        : 'bg-[#0D1428] text-[#A8B4D0] border-[#25304B] hover:text-white'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Eye Styles */}
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-2">
                Corner Finder Eyes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'square', label: 'Sharp Square' },
                  { id: 'rounded', label: 'Rounded Square' },
                  { id: 'circle', label: 'Circular Eye' },
                  { id: 'geometric', label: 'Geometric Octagon' },
                ].map((eye) => (
                  <button
                    key={eye.id}
                    onClick={() => update({ eyeStyle: eye.id as EyeStyle })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      config.eyeStyle === eye.id
                        ? 'bg-[#246BFD] text-white border-[#246BFD] shadow-sm'
                        : 'bg-[#0D1428] text-[#A8B4D0] border-[#25304B] hover:text-white'
                    }`}
                  >
                    {eye.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Correction & Margin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#25304B]">
              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                  Error Correction Level
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => update({ errorCorrection: lvl })}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        config.errorCorrection === lvl
                          ? 'bg-[#15D9F5] text-[#080B18] border-[#15D9F5]'
                          : 'bg-[#0D1428] text-[#A8B4D0] border-[#25304B] hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#A8B4D0] mt-1">
                  H (30% recovery) is recommended when adding logos or artistic frames.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#A8B4D0]">Quiet Zone Margin</label>
                  <span className="text-xs font-mono text-[#15D9F5]">{config.quietZone || 3} blocks</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={config.quietZone || 3}
                  onChange={(e) => update({ quietZone: Number(e.target.value) })}
                  className="w-full accent-[#15D9F5] bg-[#0D1428]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLORS & GLOW */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            {/* Gradient Preset Palettes */}
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider mb-2">
                Designer Color Palettes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {colorPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      update({
                        useGradient: true,
                        gradientStart: preset.start,
                        gradientEnd: preset.end,
                        backgroundColor: preset.bg,
                        isTransparentBg: false,
                        eyeColor: preset.start,
                      })
                    }
                    className="p-2 rounded-lg bg-[#0D1428] border border-[#25304B] hover:border-[#15D9F5] flex items-center space-x-2 transition-all text-left"
                  >
                    <div
                      className="w-5 h-5 rounded-md shrink-0 border border-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${preset.start}, ${preset.end})`,
                      }}
                    />
                    <span className="text-xs font-medium text-[#F8FAFF] truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Foreground & Gradient */}
            <div className="p-3 bg-[#0D1428] rounded-xl border border-[#25304B] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#F8FAFF]">Enable Gradient Foreground</label>
                <input
                  type="checkbox"
                  checked={config.useGradient}
                  onChange={(e) => update({ useGradient: e.target.checked })}
                  className="w-4 h-4 rounded border-[#25304B] bg-[#111A31] text-[#7657FF]"
                />
              </div>

              {config.useGradient ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#25304B]">
                  <div>
                    <label className="block text-[11px] text-[#A8B4D0] mb-1">Gradient Start</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.gradientStart}
                        onChange={(e) => update({ gradientStart: e.target.value })}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={config.gradientStart}
                        onChange={(e) => update({ gradientStart: e.target.value })}
                        className="w-20 px-2 py-1 rounded bg-[#111A31] border border-[#25304B] text-xs font-mono text-[#F8FAFF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A8B4D0] mb-1">Gradient End</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.gradientEnd}
                        onChange={(e) => update({ gradientEnd: e.target.value })}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={config.gradientEnd}
                        onChange={(e) => update({ gradientEnd: e.target.value })}
                        className="w-20 px-2 py-1 rounded bg-[#111A31] border border-[#25304B] text-xs font-mono text-[#F8FAFF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A8B4D0] mb-1">Direction</label>
                    <select
                      value={config.gradientType}
                      onChange={(e) => update({ gradientType: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded bg-[#111A31] border border-[#25304B] text-xs text-[#F8FAFF]"
                    >
                      <option value="linear-horizontal">Horizontal</option>
                      <option value="linear-vertical">Vertical</option>
                      <option value="radial">Radial</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] text-[#A8B4D0] mb-1">Solid Foreground Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.foregroundColor}
                      onChange={(e) => update({ foregroundColor: e.target.value })}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.foregroundColor}
                      onChange={(e) => update({ foregroundColor: e.target.value })}
                      className="w-24 px-2 py-1 rounded bg-[#111A31] border border-[#25304B] text-xs font-mono text-[#F8FAFF]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Background & Eye Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#0D1428] rounded-xl border border-[#25304B] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#F8FAFF]">Background Color</label>
                  <label className="flex items-center space-x-1.5 text-[11px] text-[#A8B4D0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.isTransparentBg}
                      onChange={(e) => update({ isTransparentBg: e.target.checked })}
                      className="w-3.5 h-3.5 rounded text-[#7657FF]"
                    />
                    <span>Transparent</span>
                  </label>
                </div>
                {!config.isTransparentBg && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => update({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.backgroundColor}
                      onChange={(e) => update({ backgroundColor: e.target.value })}
                      className="w-24 px-2 py-1 rounded bg-[#111A31] border border-[#25304B] text-xs font-mono text-[#F8FAFF]"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#0D1428] rounded-xl border border-[#25304B] space-y-2">
                <label className="text-xs font-semibold text-[#F8FAFF] block">Corner Eye Color</label>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="color"
                    value={config.eyeColor}
                    onChange={(e) => update({ eyeColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.eyeColor}
                    onChange={(e) => update({ eyeColor: e.target.value })}
                    className="w-24 px-2 py-1 rounded bg-[#111A31] border border-[#25304B] text-xs font-mono text-[#F8FAFF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGO & CENTER */}
        {activeTab === 'logo' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#F8FAFF] uppercase tracking-wider">
                  Center Emblem / Brand Logo
                </h4>
                <p className="text-[11px] text-[#A8B4D0]">
                  Adds a centered icon. Automatically configures High (30%) Error Correction for safety.
                </p>
              </div>
              {config.logoUrl && (
                <button
                  onClick={() => update({ logoUrl: undefined })}
                  className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-xs flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* File Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#25304B] hover:border-[#15D9F5] bg-[#0D1428] text-xs font-semibold text-[#F8FAFF] flex items-center justify-center space-x-2 transition-all"
              >
                <ImageIcon className="w-4 h-4 text-[#15D9F5]" />
                <span>Upload Custom Logo (PNG, SVG, JPG)</span>
              </button>
            </div>

            {/* Quick Logo Presets */}
            <div>
              <label className="block text-xs font-semibold text-[#A8B4D0] mb-2">
                Quick Logo Symbols
              </label>
              <div className="flex space-x-3">
                {logoPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => update({ logoUrl: preset.url, errorCorrection: 'H' })}
                    className="p-2 rounded-lg bg-[#0D1428] border border-[#25304B] hover:border-[#7657FF] flex items-center space-x-2 transition-all"
                  >
                    <img src={preset.url} alt={preset.name} className="w-6 h-6 rounded" />
                    <span className="text-xs text-[#F8FAFF]">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {config.logoUrl && (
              <div className="p-4 bg-[#0D1428] rounded-xl border border-[#25304B] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-[#A8B4D0]">Logo Size</label>
                      <span className="text-xs font-mono text-[#15D9F5]">{config.logoSize}%</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={26}
                      value={config.logoSize}
                      onChange={(e) => update({ logoSize: Number(e.target.value) })}
                      className="w-full accent-[#7657FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                      Logo Background Shield
                    </label>
                    <select
                      value={config.logoBackground}
                      onChange={(e) => update({ logoBackground: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded bg-[#111A31] border border-[#25304B] text-xs text-[#F8FAFF]"
                    >
                      <option value="none">None (Transparent)</option>
                      <option value="circle">Circular Shield</option>
                      <option value="rounded">Rounded Square Shield</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FRAME & BADGES */}
        {activeTab === 'frame' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#F8FAFF] uppercase tracking-wider">
                  Call-to-Action Frame
                </h4>
                <p className="text-[11px] text-[#A8B4D0]">
                  Add a banner badge to maximize scan conversions.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.hasFrame}
                onChange={(e) => update({ hasFrame: e.target.checked })}
                className="w-4 h-4 rounded text-[#7657FF]"
              />
            </div>

            {config.hasFrame && (
              <div className="p-4 bg-[#0D1428] rounded-xl border border-[#25304B] space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                    Frame Text / Call to Action
                  </label>
                  <input
                    type="text"
                    value={config.frameText}
                    onChange={(e) => update({ frameText: e.target.value })}
                    placeholder="SCAN ME"
                    className="w-full px-3 py-2 rounded-lg bg-[#111A31] border border-[#25304B] text-sm text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none uppercase font-bold"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['SCAN ME', 'SCAN HERE', 'FOLLOW US', 'CONNECT WI-FI', 'VIEW MENU', 'PAY HERE'].map((txt) => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => update({ frameText: txt })}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#111A31] border border-[#25304B] text-[#A8B4D0] hover:text-white"
                    >
                      {txt}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Position</label>
                    <select
                      value={config.framePosition}
                      onChange={(e) => update({ framePosition: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded bg-[#111A31] border border-[#25304B] text-xs text-[#F8FAFF]"
                    >
                      <option value="bottom">Bottom Banner</option>
                      <option value="top">Top Header</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Badge Background</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.frameBgColor}
                        onChange={(e) => update({ frameBgColor: e.target.value })}
                        className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={config.frameBgColor}
                        onChange={(e) => update({ frameBgColor: e.target.value })}
                        className="w-20 px-2 py-1 rounded bg-[#111A31] border border-[#25304B] text-xs font-mono text-[#F8FAFF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">Text Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.frameTextColor}
                        onChange={(e) => update({ frameTextColor: e.target.value })}
                        className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={config.frameTextColor}
                        onChange={(e) => update({ frameTextColor: e.target.value })}
                        className="w-20 px-2 py-1 rounded bg-[#111A31] border border-[#25304B] text-xs font-mono text-[#F8FAFF]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: EXPORT & PRINT */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-[#F8FAFF] uppercase tracking-wider mb-2">
                Export Resolution Presets
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[128, 256, 512, 1024, 2048].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedHiRes(size);
                      update({ size });
                    }}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-mono font-bold transition-all ${
                      selectedHiRes === size
                        ? 'bg-[#15D9F5] text-[#080B18] border-[#15D9F5]'
                        : 'bg-[#0D1428] text-[#A8B4D0] border-[#25304B] hover:text-white'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => onDownloadPNG(selectedHiRes)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#7657FF] to-[#246BFD] hover:from-[#896DFF] hover:to-[#387BFE] text-white text-xs font-bold shadow-lg flex items-center justify-center space-x-2 transition-all glow-violet"
              >
                <Download className="w-4 h-4" />
                <span>PNG ({selectedHiRes}px)</span>
              </button>

              <button
                onClick={onDownloadSVG}
                className="py-3 px-4 rounded-xl bg-[#0D1428] hover:bg-[#1A2646] text-[#15D9F5] border border-[#25304B] text-xs font-bold shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Vector SVG</span>
              </button>

              <button
                onClick={onDownloadPDF}
                className="py-3 px-4 rounded-xl bg-[#0D1428] hover:bg-[#1A2646] text-[#F8FAFF] border border-[#25304B] text-xs font-bold shadow-lg flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Real-Time Scan Reliability Status Bar */}
        <div className="mt-4 p-3 rounded-xl bg-[#0D1428] border border-[#25304B] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {verificationScore >= 80 ? (
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-[#10B981]">
                <FileCheck className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#F8FAFF]">
                  {verificationScore >= 80 ? 'Scan Reliability: 100%' : 'Scan Warning'}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    verificationScore >= 80 ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  Verified with jsQR
                </span>
              </div>
              <p className="text-[11px] text-[#A8B4D0]">{verificationNotes}</p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="p-1.5 rounded-lg text-[#A8B4D0] hover:text-white hover:bg-[#111A31] transition-all"
            title="Reset Design"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
