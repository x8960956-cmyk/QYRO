import React, { useState } from 'react';
import {
  QrCode,
  Scan,
  Sparkles,
  Zap,
  Layers,
  LayoutGrid,
  BarChart3,
  User,
  Menu,
  X,
  Plus,
  FolderOpen
} from 'lucide-react';
import { AuthUser, GoogleLogoIcon } from './AuthModal';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: null },
    { id: 'generator', label: 'QR Generator', icon: QrCode },
    { id: 'scanner', label: 'Scanner', icon: Scan },
    { id: 'art-studio', label: 'AI Art Studio', icon: Sparkles, badge: 'AI' },
    { id: 'dynamic', label: 'Dynamic QR', icon: Zap },
    { id: 'bulk', label: 'Bulk Generator', icon: Layers },
    { id: 'templates', label: 'Templates', icon: LayoutGrid },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'my-qrs', label: 'My Vault', icon: FolderOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080B18]/90 backdrop-blur-md border-b border-[#25304B]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            {/* Custom Geometric Q Symbol */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#7657FF] via-[#246BFD] to-[#15D9F5] p-[2px] transition-transform duration-300 group-hover:scale-105 glow-violet">
              <div className="w-full h-full bg-[#080B18] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                {/* Glowing geometry */}
                <div className="w-5 h-5 rounded-md border-2 border-[#15D9F5] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-[2px] bg-[#7657FF]" />
                </div>
                <div className="absolute bottom-1.5 right-1.5 w-2.5 h-1 bg-[#15D9F5] rotate-45 rounded-sm" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-[#F8FAFF] via-[#15D9F5] to-[#7657FF] bg-clip-text text-transparent font-heading">
                QYRO
              </span>
              <span className="text-[10px] tracking-widest text-[#A8B4D0] uppercase font-mono -mt-1 hidden sm:block">
                Scan Different
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-[#111A31] text-[#15D9F5] border border-[#25304B] shadow-inner'
                      : 'text-[#A8B4D0] hover:text-[#F8FAFF] hover:bg-[#0D1428]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-gradient-to-r from-[#7657FF] to-[#15D9F5] text-white">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-[#7657FF] to-[#15D9F5] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action / Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => onSelectTab('generator')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#7657FF] to-[#246BFD] hover:from-[#896DFF] hover:to-[#387BFE] text-white shadow-md glow-violet flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create QR</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2 bg-[#111A31] border border-[#25304B] px-3 py-1 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[#7657FF]/30 border border-[#7657FF] text-[#15D9F5] flex items-center justify-center text-[11px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-[#F8FAFF] font-medium max-w-[100px] truncate">
                  {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="text-[11px] text-[#A8B4D0] hover:text-red-400 ml-1 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111A31] hover:bg-[#1A2646] border border-[#25304B] text-[#F8FAFF] flex items-center space-x-1.5 transition-all"
              >
                <User className="w-3.5 h-3.5 text-[#15D9F5]" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => onSelectTab('generator')}
              className="p-1.5 rounded-lg bg-[#7657FF] text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#111A31] text-[#A8B4D0] hover:text-white border border-[#25304B]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D1428] border-b border-[#25304B] px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-2.5 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-[#7657FF] text-white'
                      : 'bg-[#111A31] text-[#A8B4D0] hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#25304B] flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-[#A8B4D0]">Signed in as {user.email}</span>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400 font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center rounded-lg bg-[#111A31] border border-[#25304B] text-xs font-bold text-[#15D9F5]"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
