import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Trophy, 
  Crown, 
  ShieldCheck, 
  Check, 
  Trash2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { HouseholdMember, BossCheckin } from '../types';

interface GuildViewProps {
  guildMembers: HouseholdMember[];
  onAddMember: (newMember: HouseholdMember) => void;
  onRemoveMember: (id: string) => void;
  activeUser: string;
  onSelectActiveUser: (name: string) => void;
  bossCheckins: BossCheckin[];
  onResetSeedData: () => void;
}

export const GuildView: React.FC<GuildViewProps> = ({
  guildMembers,
  onAddMember,
  onRemoveMember,
  activeUser,
  onSelectActiveUser,
  bossCheckins,
  onResetSeedData
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<HouseholdMember['role']>('Membro');
  const [newMemberAvatar, setNewMemberAvatar] = useState('⚔️');
  const [isAdding, setIsAdding] = useState(false);

  // Compute leaderboard from boss checkins (each checkin gives 10 points)
  const memberPointsMap: Record<string, number> = {};
  bossCheckins.forEach(c => {
    const name = c.memberName;
    memberPointsMap[name] = (memberPointsMap[name] || 0) + (c.points || 10);
  });

  const leaderboard = Object.entries(memberPointsMap)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    onAddMember({
      id: `member-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      avatar: newMemberAvatar,
      active: true
    });

    setNewMemberName('');
    setIsAdding(false);
  };

  const AVATAR_OPTIONS = ['⚔️', '🛡️', '🧙‍♂️', '🏹', '🗡️', '✨', '👑', '🔥', '🦅', '🐺'];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Diretório da Guilda</h2>
            <p className="text-xs text-slate-400">Gerenciamento de membros, cargos e pontuação de presença</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Membro</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Deseja recarregar os dados de exemplo (crafts, status e bosses)?')) {
                onResetSeedData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-semibold transition"
            title="Recarregar Dados Iniciais de Demonstração"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar Exemplo</span>
          </button>
        </div>
      </div>

      {/* Add Member Form (Accordion) */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Cadastrar Novo Membro na Guilda</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome / Nickname *</label>
              <input
                type="text"
                required
                placeholder="Ex: Valkiria"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo</label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as HouseholdMember['role'])}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Líder">Líder</option>
                <option value="Oficial">Oficial</option>
                <option value="Membro">Membro</option>
                <option value="Recruta">Recruta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ícone / Avatar</label>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setNewMemberAvatar(av)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${
                      newMemberAvatar === av ? 'bg-indigo-600 ring-2 ring-indigo-400' : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 text-xs font-semibold hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Confirmar Cadastro
            </button>
          </div>
        </form>
      )}

      {/* Grid: Members Cards & Attendance Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Members List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Membros Registrados ({guildMembers.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guildMembers.map((member) => {
              const isActive = activeUser.toLowerCase() === member.name.toLowerCase();
              return (
                <div 
                  key={member.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                      {member.avatar || '⚔️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm sm:text-base">{member.name}</span>
                        {isActive && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-indigo-500 text-white">
                            VOCÊ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          member.role === 'Líder' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          member.role === 'Oficial' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isActive && (
                      <button
                        onClick={() => onSelectActiveUser(member.name)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold transition"
                        title="Trocar para este perfil"
                      >
                        Operar
                      </button>
                    )}
                    {guildMembers.length > 1 && (
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Remover Membro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Attendance Points Leaderboard */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Ranking de Presença</h3>
            </div>
            <span className="text-[11px] text-amber-400 font-semibold">+10 pts / raid</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Nenhum check-in em boss registrado ainda. Membros que confirmarem presença na aba de Bosses pontuarão aqui!
            </div>
          ) : (
            <div className="space-y-2.5">
              {leaderboard.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                      idx === 0 ? 'bg-amber-500 text-slate-950' :
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-white' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{item.name}</span>
                  </div>
                  <div className="font-mono font-extrabold text-amber-300 text-sm">
                    {item.points} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
