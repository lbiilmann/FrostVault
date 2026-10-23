import React from 'react';
import { Snowflake, Plus, Printer, Layers, Eye, ClipboardList, Flame, Globe, Barcode } from 'lucide-react';

interface HeaderProps {
  activeTab: 'inventory' | 'schematic' | 'zones' | 'defrost' | 'print';
  setActiveTab: (tab: 'inventory' | 'schematic' | 'zones' | 'defrost' | 'print') => void;
  onAddItem: () => void;
  onOpenAdviceModal: () => void;
  onOpenScanner: () => void;
  urgentCount: number;
  thawingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onAddItem,
  onOpenAdviceModal,
  onOpenScanner,
  urgentCount,
  thawingCount,
}) => {
  // First line of tabs
  const lineOneTabs = [
    { id: 'inventory' as const, label: 'Fryseroversigt', icon: ClipboardList },
    { id: 'schematic' as const, label: 'Visuel fryser', icon: Eye },
    { id: 'zones' as const, label: 'Indret hylder', icon: Layers },
  ];

  // Second line of tabs
  const lineTwoTabs = [
    {
      id: 'defrost' as const,
      label: 'Optøning & Madplan',
      icon: Flame,
      badge: urgentCount > 0 || thawingCount > 0,
      badgeTitle: `${urgentCount} varer haster`,
    },
    { id: 'print' as const, label: 'Lågeseddel', icon: Printer },
  ];

  const allTabs = [...lineOneTabs, ...lineTwoTabs];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar: Brand, Search Advisor & Primary Action */}
        <div className="flex items-center justify-between gap-3 h-14 md:h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-sm shadow-cyan-600/20 shrink-0">
              <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                FrostVault
              </span>
              <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
                Fryseroversigt
              </span>
            </div>
          </div>

          {/* Desktop single-row tabs (on md and up) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {'badge' in tab && tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title={tab.badgeTitle} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenScanner}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              title="Scan stregkode på emballage eller QR-kode på beholder"
            >
              <Barcode className="w-4 h-4 text-cyan-700 shrink-0" />
              <span className="hidden sm:inline">Scan kode</span>
            </button>

            <button
              onClick={onOpenAdviceModal}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              title="Spørg Google om fryseråd og holdbarhed (Google Search Grounding)"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span className="hidden sm:inline">Spørg Google</span>
              <span className="sm:hidden">Råd</span>
            </button>

            <button
              onClick={onAddItem}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer min-h-[38px] touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Tilføj vare</span>
            </button>
          </div>
        </div>

        {/* Two Lines for Tabs (Shown on mobile & tablets under lg) */}
        <div className="lg:hidden border-t border-slate-100 py-2.5 -mx-4 px-4 bg-slate-50/70 space-y-1.5">
          {/* Tab Line 1: 3 columns */}
          <div className="grid grid-cols-3 gap-1.5">
            {lineOneTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] touch-manipulation text-center ${
                    isActive
                      ? 'bg-white text-cyan-900 font-semibold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Line 2: 2 columns */}
          <div className="grid grid-cols-2 gap-1.5">
            {lineTwoTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] touch-manipulation text-center ${
                    isActive
                      ? 'bg-white text-cyan-900 font-semibold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title={tab.badgeTitle} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
