import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { UniversalGenerator } from './components/UniversalGenerator';
import { QRScanner } from './components/QRScanner';
import { DynamicQRManager } from './components/DynamicQRManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BulkQRGenerator } from './components/BulkQRGenerator';
import { TemplateLibrary } from './components/TemplateLibrary';
import { QRArtStudio } from './components/QRArtStudio';
import { MyVault } from './components/MyVault';
import { AuthModal, AuthUser } from './components/AuthModal';
import { SEOLandingPages } from './components/SEOLandingPages';
import { AdPlacement } from './components/AdPlacement';
import { QRCategory, QRDesignConfig, QRTemplate } from './types/qr';
import {
  QrCode,
  Scan,
  Zap,
  Sparkles,
  LayoutGrid,
  Home,
  FolderOpen
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [generatorCategory, setGeneratorCategory] = useState<QRCategory>('url');
  const [generatorData, setGeneratorData] = useState<any>(undefined);
  const [generatorDesign, setGeneratorDesign] = useState<Partial<QRDesignConfig> | undefined>(undefined);
  const [analyticsQRId, setAnalyticsQRId] = useState<string | null>(null);
  const [landingPageId, setLandingPageId] = useState<string>('text-to-qr');

  // User Auth State
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('qyro_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle template selection
  const handleSelectTemplate = (template: QRTemplate) => {
    setGeneratorCategory(template.qrCategory);
    setGeneratorData(template.defaultData);
    setGeneratorDesign(template.design);
    setCurrentTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle navigate from home or landing pages
  const handleNavigate = (tab: string, category?: string) => {
    if (tab === 'landing' && category) {
      setLandingPageId(category);
      setCurrentTab('landing');
    } else {
      if (category) {
        setGeneratorCategory(category as QRCategory);
      }
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle opening Dynamic QR in generator
  const handleOpenDynamicInGenerator = (shortUrl: string, title: string) => {
    setGeneratorCategory('url');
    setGeneratorData({ url: shortUrl });
    setCurrentTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle view analytics for a specific dynamic QR
  const handleViewAnalytics = (qrId: string) => {
    setAnalyticsQRId(qrId);
    setCurrentTab('analytics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle saving QR to vault
  const handleSaveToVault = (qrRecord: any) => {
    try {
      const existing = localStorage.getItem('qyro_saved_qrs');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift({ ...qrRecord, id: 'saved-' + Date.now() });
      localStorage.setItem('qyro_saved_qrs', JSON.stringify(list));

      // Also persist to backend
      fetch('/api/saved-qrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrRecord),
      }).catch(console.warn);
    } catch (e) {
      console.warn('Failed to save to vault:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qyro_user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#080B18] text-[#F8FAFF] flex flex-col font-sans selection:bg-[#7657FF] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        {currentTab === 'home' && <HomeHero onNavigate={handleNavigate} />}

        {currentTab === 'generator' && (
          <UniversalGenerator
            initialCategory={generatorCategory}
            initialData={generatorData}
            initialDesign={generatorDesign}
            onSaveToVault={handleSaveToVault}
          />
        )}

        {currentTab === 'scanner' && <QRScanner />}

        {currentTab === 'art-studio' && <QRArtStudio />}

        {currentTab === 'dynamic' && (
          <DynamicQRManager
            onViewAnalytics={handleViewAnalytics}
            onOpenInGenerator={handleOpenDynamicInGenerator}
          />
        )}

        {currentTab === 'bulk' && <BulkQRGenerator />}

        {currentTab === 'templates' && (
          <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsDashboard
            selectedQRId={analyticsQRId}
            onClearSelectedQR={() => setAnalyticsQRId(null)}
          />
        )}

        {currentTab === 'my-qrs' && (
          <MyVault
            onOpenInGenerator={(cat, data, des) => {
              setGeneratorCategory(cat as QRCategory);
              setGeneratorData(data);
              setGeneratorDesign(des);
              setCurrentTab('generator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'landing' && (
          <SEOLandingPages
            pageId={landingPageId}
            onLaunchGenerator={(cat) => {
              setGeneratorCategory(cat);
              setCurrentTab('generator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Discrete Non-Intrusive Sponsor Placement */}
        {['home', 'templates', 'bulk'].includes(currentTab) && <AdPlacement />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B18]/95 backdrop-blur-md border-t border-[#25304B] px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'generator', label: 'Create', icon: QrCode },
          { id: 'scanner', label: 'Scan', icon: Scan },
          { id: 'dynamic', label: 'Dynamic', icon: Zap },
          { id: 'my-qrs', label: 'Vault', icon: FolderOpen },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#15D9F5]' : 'text-[#A8B4D0] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
