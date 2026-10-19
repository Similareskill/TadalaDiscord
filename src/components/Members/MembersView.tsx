import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Swords, 
  Flame, 
  Trophy, 
  UserPlus, 
  Search, 
  Crosshair,
  Crown
} from 'lucide-react';
import { MemberStatus } from '../../types';
import { MemberCard } from './MemberCard';

interface MembersViewProps {
  members: MemberStatus[];
  onOpenNewStatus: () => void;
  onEditStatus: (member: MemberStatus) => void;
  onDeleteStatus: (id: string) => void;
  onViewImgur: (url: string, memberName: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  onOpenNewStatus,
  onEditStatus,
  onDeleteStatus,
  onViewImgur
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Todas');

  // Sort members by Power descending for rank
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => (b.power || 0) - (a.power || 0));
  }, [members]);

  // Unique classes list
  const classesList = useMemo(() => {
    const set = new Set<string>();
    members.forEach(m => {
      if (m.classe) set.add(m.classe);
    });
    return ['Todas', ...Array.from(set)];
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return sortedMembers.filter(m => {
      const matchSearch = 
        !searchTerm.trim() ||
        m.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.classe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClass = selectedClass === 'Todas' || m.classe === selectedClass;
      return matchSearch && matchClass;
    });
  }, [sortedMembers, searchTerm, selectedClass]);

  // Top stats highlights
  const topPowerMember = sortedMembers[0];
  const topDanoMember = [...members].sort((a, b) => (b.dano || 0) - (a.dano || 0))[0];
  const topDefesaMember = [...members].sort((a, b) => (b.defesa || 0) - (a.defesa || 0))[0];

  return (
    <div className="space-y-6">
      
      {/* Top Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Top Power */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-slate-900 border border-amber-500/40 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Maior Power Geral</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {topPowerMember ? topPowerMember.memberName : 'N/A'}
            </div>
            <div className="text-xs font-bold text-amber-300">
              {topPowerMember ? `${topPowerMember.power?.toLocaleString('pt-BR')} Power` : '-'}
            </div>
          </div>
        </div>

        {/* Top Dano */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-slate-900 border border-red-500/40 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-red-400">
              <Flame className="w-3.5 h-3.5" />
              <span>Maior Dano (DPS)</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {topDanoMember ? topDanoMember.memberName : 'N/A'}
            </div>
            <div className="text-xs font-bold text-red-300">
              {topDanoMember ? `${topDanoMember.dano?.toLocaleString('pt-BR')} Dano` : '-'}
            </div>
          </div>
        </div>

        {/* Top Defesa */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-slate-900 border border-blue-500/40 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-blue-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Maior Defesa (Tanque)</span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {topDefesaMember ? topDefesaMember.memberName : 'N/A'}
            </div>
            <div className="text-xs font-bold text-blue-300">
              {topDefesaMember ? `${topDefesaMember.defesa?.toLocaleString('pt-BR')} Defesa` : '-'}
            </div>
          </div>
        </div>

      </div>

      {/* Control bar: search, class filter, and add button */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do membro, classe ou notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Class filter */}
          {classesList.length > 2 && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none"
            >
              {classesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* Add Member Status button */}
          <button
            onClick={onOpenNewStatus}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/20 transition active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Meu Status</span>
          </button>
        </div>

      </div>

      {/* Members Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Shield className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">Nenhum membro encontrado</h3>
          <p className="text-xs text-slate-400">
            Cadastre os status de combate para montar o ranking da guilda!
          </p>
          <button
            onClick={onOpenNewStatus}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
          >
            Registrar Primeiro Status
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              rankIndex={index}
              onEdit={onEditStatus}
              onDelete={onDeleteStatus}
              onViewImgur={onViewImgur}
            />
          ))}
        </div>
      )}

    </div>
  );
};
