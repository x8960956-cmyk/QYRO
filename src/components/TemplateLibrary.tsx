import React, { useState } from 'react';
import { QRTemplate } from '../types/qr';
import { QR_TEMPLATES } from '../utils/qrTemplates';
import {
  LayoutGrid,
  Search,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  Briefcase,
  User,
  Calendar,
  Share2,
  CreditCard,
  Check
} from 'lucide-react';

interface TemplateLibraryProps {
  onSelectTemplate: (template: QRTemplate) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Business', 'Restaurants', 'Personal', 'Social Media', 'Events', 'Payments'];

  const filteredTemplates = QR_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#7657FF]/10 border border-[#7657FF]/30 text-xs font-semibold text-[#15D9F5]">
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Curated Design Presets</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFF] font-heading">
          QR Code Template Gallery
        </h1>
        <p className="text-sm text-[#A8B4D0]">
          One-click designer presets optimized for maximum scannability and visual brand appeal.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#7657FF] to-[#246BFD] text-white shadow-md glow-violet'
                  : 'bg-[#111A31] text-[#A8B4D0] hover:text-[#F8FAFF] border border-[#25304B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#A8B4D0] absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2 bg-[#111A31] border border-[#25304B] rounded-xl text-xs text-[#F8FAFF] placeholder-[#4B597B] focus:border-[#15D9F5] focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const startCol = template.design.gradientStart || template.design.foregroundColor || '#7657FF';
          const endCol = template.design.gradientEnd || template.design.foregroundColor || '#15D9F5';
          const bgCol = template.design.backgroundColor || '#080B18';

          return (
            <div
              key={template.id}
              className="bg-[#111A31] border border-[#25304B] hover:border-[#15D9F5]/50 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Visual Preview Header Mini Box */}
                <div
                  className="w-full h-36 rounded-xl relative overflow-hidden flex items-center justify-center border border-[#25304B]/60 shadow-inner mb-4 transition-transform group-hover:scale-[1.01]"
                  style={{ backgroundColor: bgCol }}
                >
                  {/* Subtle simulated QR graphic */}
                  <div
                    className="w-24 h-24 rounded-lg flex items-center justify-center p-2 border-2"
                    style={{ borderColor: startCol }}
                  >
                    <div
                      className="w-16 h-16 rounded-md flex items-center justify-center"
                      style={{
                        background: template.design.useGradient
                          ? `linear-gradient(135deg, ${startCol}, ${endCol})`
                          : startCol,
                      }}
                    >
                      <Sparkles className="w-6 h-6 text-[#080B18]" />
                    </div>
                  </div>

                  {template.badge && (
                    <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#7657FF] text-white shadow-md">
                      {template.badge}
                    </span>
                  )}

                  <span className="absolute bottom-2 left-2.5 text-[10px] font-mono text-[#A8B4D0]/80">
                    {template.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#F8FAFF] font-heading group-hover:text-[#15D9F5] transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-[#A8B4D0] mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectTemplate(template)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0D1428] hover:bg-gradient-to-r hover:from-[#7657FF] hover:to-[#246BFD] text-[#15D9F5] hover:text-white border border-[#25304B] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
