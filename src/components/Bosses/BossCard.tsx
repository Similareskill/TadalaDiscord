import React, { useState, useEffect } from 'react';
import { 
  Skull, 
  MapPin, 
  Flame, 
  Clock, 
  Gift, 
  UserCheck, 
  CheckCircle2, 
  Trash2, 
  Edit3,
  Users
} from 'lucide-react';
import { BossEvent, BossCheckin } from '../../types';

interface BossCardProps {
  boss: BossEvent;
  checkins: BossCheckin[];
  activeUser: string;
  onCheckin: (boss: BossEvent) => void;
  onEdit: (boss: BossEvent) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (boss: BossEvent, nextStatus: BossEvent['status']) => void;
}

export const BossCard: React.FC<BossCardProps> = ({
  boss,
  checkins,
  activeUser,
  onCheckin,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isSpawned, setIsSpawned] = useState(false);

  // Check if active user already checked-in for this boss
  const userCheckedIn = checkins.some(
    c => c.eventId === boss.id && c.memberName.toLowerCase() === activeUser.toLowerCase()
  );

  const eventCheckins = checkins.filter(c => c.eventId === boss.id);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(boss.spawnTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsSpawned(true);
        setTimeLeft('SPAWN ATIVO!');
      } else {
        setIsSpawned(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [boss.spawnTime]);

  const getStatusBadge = () => {
    switch (boss.status) {
      case 'em_andamento':
        return {
          label: '⚔️ EM COMBATE',
          bg: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
        };
      case 'derrotado':
        return {
          label: '✓ DERROTADO',
          bg: 'bg-slate-700/60 text-slate-400 border-slate-600'
        };
      default:
        return {
          label: isSpawned ? '🔥 VIVO NO MAPA' : '⏳ AGENDADO',
          bg: isSpawned 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl ${
      boss.status === 'derrotado'
        ? 'bg-slate-900/40 border-slate-800 opacity-70'
        : boss.status === 'em_andamento'
          ? 'bg-slate-900/95 border-red-500/50 ring-1 ring-red-500/30'
          : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600'
    }`}>
      
      {/* Card Header with Status & Countdown */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-850/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide uppercase ${statusInfo.bg}`}>
            {statusInfo.label}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-300">{timeLeft}</span>
          </div>
        </div>

        {/* Quick status switch dropdown/button */}
        <div className="flex items-center gap-1">
          {boss.status !== 'derrotado' ? (
            <button
              onClick={() => onToggleStatus(boss, 'derrotado')}
              className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Marcar como Derrotado"
            >
              Derrotado
            </button>
          ) : (
            <button
              onClick={() => onToggleStatus(boss, 'agendado')}
              className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
              title="Reagendar Boss"
            >
              Reagendar
            </button>
          )}

          <button
            onClick={() => onEdit(boss)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Editar Boss"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(boss.id)}
            className="p-1 rounded text-slate-500 hover:text-rose-400"
            title="Excluir Boss"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="p-5 space-y-4">
        
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
              <Skull className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              {boss.bossName}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{boss.location || 'Local a definir'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Min. Power: {boss.minPower?.toLocaleString('pt-BR') || '90.000'}</span>
            </div>
          </div>
        </div>

        {/* Rewards */}
        {boss.rewards && (
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-2 text-xs">
            <Gift className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-white font-semibold">Drops / Recompensas: </strong>
              {boss.rewards}
            </div>
          </div>
        )}

        {/* Notes */}
        {boss.notes && (
          <p className="text-xs text-slate-400 italic">
            "{boss.notes}"
          </p>
        )}

        {/* Attendance & Check-in Section */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Presença: <strong>{eventCheckins.length}</strong> confirmados</span>
            </div>
          </div>

          {/* Check-in CTA Button */}
          <button
            onClick={() => onCheckin(boss)}
            disabled={userCheckedIn}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              userCheckedIn
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-600/20'
            }`}
          >
            {userCheckedIn ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Presença Confirmada (+10 pts)</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Fazer Check-in na Raid</span>
              </>
            )}
          </button>

        </div>

        {/* Checked-in Members avatars/chips */}
        {eventCheckins.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {eventCheckins.map((chk, i) => (
              <span 
                key={i}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
              >
                ✓ {chk.memberName}
              </span>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
