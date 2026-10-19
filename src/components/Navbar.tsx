import React, { useState } from 'react';
import { 
  Hammer, 
  Shield, 
  Calendar, 
  History, 
  Users, 
  Plus, 
  PackagePlus, 
  UserCircle2, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { HouseholdMember } from '../types';
import DiscordLogin from './DiscordLogin';

interface NavbarProps {
  currentTab: 'craft' | 'members' | 'bosses' | 'history' | 'guild';
  onSelectTab: (tab: 'craft' | 'members' | 'bosses' | 'history' | 'guild') => void;
  activeUser: string;
  onSelectActiveUser: (name: string) => void;
  guildMembers: HouseholdMember[];
  onOpenNewItem: () => void;
  onOpenPresets: () => void;
  onOpenShare?: () => void;
  pendingCount: number;
  totalCost?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeUser,
  onSelectActiveUser,
  guildMembers,
  onOpenNewItem,
  onOpenPresets,
  onOpenShare,
  pendingCount,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  interface NavItem {
    id: 'craft' | 'members' | 'bosses' | 'history' | 'guild';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
  }

  const navItems: NavItem[] = [
    { id: 'craft', label: 'Craft & Itens', icon: Hammer, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'members', label: 'Status & Dano', icon: Shield, badge: null },
    { id: 'bosses', label: 'Bosses & Raids', icon: Calendar, badge: null },
    { id: 'history', label: 'Histórico', icon: History, badge: null },
    { id: 'guild', label: 'Guilda', icon: Users, badge: null },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('craft')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-2 ring-white/10">
              <Hammer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg sm:text-xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Lista de Craft
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Guild v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Gestão de Recursos & Status de Combate</p>
            </div>
          </div>

          {/* Quick Metrics (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-slate-700/50 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-medium">Pendentes:</span>
              <strong className="text-white text-sm font-bold">{pendingCount}</strong>
            </div>
          </div>

          {/* User selector & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active User Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs sm:text-sm font-medium transition-all shadow-sm"
                title="Trocar Jogador Ativo"
              >
                <UserCircle2 className="w-4 h-4 text-indigo-400" />
                <span className="max-w-[85px] sm:max-w-[120px] truncate text-slate-200">
                  {activeUser}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-700/60">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Operando como:</p>
                      <p className="text-sm font-bold text-white mt-0.5">{activeUser}</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {guildMembers.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectActiveUser(m.name);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-indigo-600/20 transition-colors ${
                            activeUser === m.name ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{m.avatar || '⚔️'}</span>
                            <span>{m.name}</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                            {m.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Discord Login Component */}
            <DiscordLogin 
              onUserLoaded={(u) => {
                if (u) {
                  onSelectActiveUser(u.global_name || u.username);
                }
              }} 
            />
            <button
              onClick={onOpenPresets}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-200 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Kits Rápidos de Craft"
            >
              <PackagePlus className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Kits Prontos</span>
            </button>

            {/* Add New Item Button */}
            <button
              onClick={onOpenNewItem}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Novo Item</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
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
