import React from 'react';
import { 
  Shield, 
  Swords, 
  Crosshair, 
  Flame, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Trophy,
  FileCheck
} from 'lucide-react';
import { MemberStatus } from '../../types';

interface MemberCardProps {
  member: MemberStatus;
  rankIndex: number;
  onEdit: (member: MemberStatus) => void;
  onDelete: (id: string) => void;
  onViewImgur: (url: string, memberName: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  rankIndex,
  onEdit,
  onDelete,
  onViewImgur
}) => {
  // Rank badge decoration
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return {
          label: 'TOP 1',
          bg: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black',
          border: 'border-amber-400 shadow-lg shadow-amber-500/20'
        };
      case 1:
        return {
          label: 'TOP 2',
          bg: 'bg-gradient-to-r from-slate-300 to-slate-100 text-slate-950 font-black',
          border: 'border-slate-300 shadow-md shadow-slate-300/10'
        };
      case 2:
        return {
          label: 'TOP 3',
          bg: 'bg-gradient-to-r from-amber-700 to-amber-500 text-white font-black',
          border: 'border-amber-600 shadow-md shadow-amber-700/10'
        };
      default:
        return {
          label: `#${rank + 1}`,
          bg: 'bg-slate-800 text-slate-400 font-bold',
          border: 'border-slate-700'
        };
    }
  };

  const rankInfo = getRankBadge(rankIndex);

  return (
    <div className="relative rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 shadow-xl overflow-hidden transition-all duration-200">
      
      {/* Top Banner with Rank & Class */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-850/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Rank Badge */}
          <span className={`px-2.5 py-0.5 rounded-lg text-xs tracking-wider border ${rankInfo.bg} ${rankInfo.border}`}>
            {rankInfo.label}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                {member.memberName}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                Lv. {member.level || 80}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{member.classe || 'Guerreiro'}</p>
          </div>
        </div>

        {/* Power Score Pill */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-amber-400 font-black text-base sm:text-lg">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{member.power?.toLocaleString('pt-BR') || 0}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Combat Power</span>
        </div>
      </div>

      {/* Main Stats Grid: Dano, Defesa, Acerto */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-2.5 text-center">
          
          {/* Dano */}
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40">
            <div className="flex items-center justify-center gap-1 text-red-400 text-xs font-bold uppercase mb-1">
              <Swords className="w-3.5 h-3.5" />
              <span>Dano</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white">
              {member.dano?.toLocaleString('pt-BR') || 0}
            </div>
          </div>

          {/* Defesa */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/40">
            <div className="flex items-center justify-center gap-1 text-blue-400 text-xs font-bold uppercase mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Defesa</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white">
              {member.defesa?.toLocaleString('pt-BR') || 0}
            </div>
          </div>

          {/* Acerto */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold uppercase mb-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Acerto</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white">
              {member.acerto ? `${member.acerto}%` : '95%'}
            </div>
          </div>

        </div>

        {/* Notes */}
        {member.notes && (
          <p className="text-xs text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 line-clamp-2">
            💬 {member.notes}
          </p>
        )}

        {/* Footer: Imgur verification print link & Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
          
          {/* Imgur Screenshot Verification */}
          {member.imgurUrl ? (
            <button
              onClick={() => onViewImgur(member.imgurUrl!, member.memberName)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-800/40"
              title="Ver print comprobatório de status no Imgur"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Print Verificado</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">Sem print anexado</span>
          )}

          {/* Edit & Delete actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(member)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Atualizar Status"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(member.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
              title="Excluir Registro"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
