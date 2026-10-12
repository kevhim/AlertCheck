import React from 'react';
import { AlertTriangle, ShieldCheck, Cpu, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '../ui/Badge';

export type ActiveTab = 'overview' | 'editor' | 'generator' | 'results' | 'scenarios';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOnline: boolean;
  engineMode: 'cloudflare_worker' | 'browser_local';
  findingsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isOnline,
  engineMode,
  findingsCount = 0,
}) => {
  const tabs: Array<{ id: ActiveTab; label: string; badge?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'editor', label: '1. Master Warning' },
    { id: 'generator', label: '2. Variant Generator' },
    { id: 'results', label: '3. Verification Report', badge: findingsCount },
    { id: 'scenarios', label: 'Test Scenarios & Limitations' },
  ];

  return (
    <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">AlertCheck</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">v1.0.0</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Emergency Information Integrity Verifier</p>
            </div>
          </div>

          {/* Engine & Offline status pills */}
          <div className="flex items-center gap-3">
            {engineMode === 'cloudflare_worker' ? (
              <Badge variant="success" className="hidden sm:inline-flex">
                <Cpu className="w-3 h-3" />
                Cloudflare Worker API
              </Badge>
            ) : (
              <Badge variant="warning" className="hidden sm:inline-flex">
                <Cpu className="w-3 h-3" />
                Browser Local Engine (Offline Fallback)
              </Badge>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline Ready</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/60 overflow-x-auto py-2 -mb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500/20 text-red-400 font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
