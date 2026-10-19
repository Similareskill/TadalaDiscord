import React, { useState } from 'react';
import { Skull, Plus, Calendar, Clock, Filter, AlertTriangle } from 'lucide-react';
import { BossEvent, BossCheckin } from '../../types';
import { BossCard } from './BossCard';

interface BossViewProps {
  bosses: BossEvent[];
  checkins: BossCheckin[];
  activeUser: string;
  onOpenNewBoss: () => void;
  onCheckin: (boss: BossEvent) => void;
  onEditBoss: (boss: BossEvent) => void;
  onDeleteBoss: (id: string) => void;
  onToggleStatus: (boss: BossEvent, status: BossEvent['status']) => void;
}

export const BossView: React.FC<BossViewProps> = ({
  bosses,
  checkins,
  activeUser,
  onOpenNewBoss,
  onCheckin,
  onEditBoss,
  onDeleteBoss,
  onToggleStatus
}) => {
  const [filter, setFilter] = useState<'all' | 'agendado' | 'em_andamento' | 'derrotado'>('all');

  const filteredBosses = bosses.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const activeRaidCount = bosses.filter(b => b.status === 'em_andamento').length;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Cronograma de Bosses & Raids</h2>
              {activeRaidCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-600 text-white animate-pulse">
                  {activeRaidCount} RAID ATIVA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Timers de spawn e confirmação de presença na guilda</p>
          </div>
        </div>

        <button
          onClick={onOpenNewBoss}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/20 transition active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Agendar Boss</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: `Todos (${bosses.length})` },
          { id: 'em_andamento', label: `Em Combate (${bosses.filter(b => b.status === 'em_andamento').length})` },
          { id: 'agendado', label: `Agendados (${bosses.filter(b => b.status === 'agendado').length})` },
          { id: 'derrotado', label: `Derrotados (${bosses.filter(b => b.status === 'derrotado').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              filter === tab.id
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Boss Cards Grid */}
      {filteredBosses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">Nenhum evento de boss cadastrado</h3>
          <p className="text-xs text-slate-400">
            Agende o próximo World Boss para coordenar a presença da sua guilda!
          </p>
          <button
            onClick={onOpenNewBoss}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
          >
            Agendar Primeiro Boss
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBosses.map((boss) => (
            <BossCard
              key={boss.id}
              boss={boss}
              checkins={checkins}
              activeUser={activeUser}
              onCheckin={onCheckin}
              onEdit={onEditBoss}
              onDelete={onDeleteBoss}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}

    </div>
  );
};
