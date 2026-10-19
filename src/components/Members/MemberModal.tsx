import React, { useState, useEffect } from 'react';
import { X, Shield, Swords, Crosshair, Flame, Image, Save, Calculator } from 'lucide-react';
import { MemberStatus, HouseholdMember } from '../../types';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<MemberStatus, 'id'>) => Promise<void>;
  editingMember?: MemberStatus | null;
  guildMembers: HouseholdMember[];
  activeUser: string;
}

const COMMON_CLASSES = [
  'Cavaleiro da Morte',
  'Paladino Sagrado',
  'Guerreiro Berserker',
  'Arquimago Elemental',
  'Feiticeiro das Trevas',
  'Caçador Fantasma',
  'Arqueiro de Prata',
  'Assassino Noturno',
  'Curandeiro Sagrado',
  'Bardo da Tempestade'
];

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember,
  guildMembers,
  activeUser
}) => {
  const [memberName, setMemberName] = useState('');
  const [level, setLevel] = useState(80);
  const [classe, setClasse] = useState('Guerreiro Berserker');
  const [dano, setDano] = useState(4500);
  const [defesa, setDefesa] = useState(4200);
  const [acerto, setAcerto] = useState(95);
  const [power, setPower] = useState(115000);
  const [imgurUrl, setImgurUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate suggested Power when Dano/Defesa/Acerto changes
  const calculateSuggestedPower = (d: number, def: number, ac: number, lvl: number) => {
    return Math.round((d * 12) + (def * 10) + (ac * 200) + (lvl * 150));
  };

  useEffect(() => {
    if (editingMember) {
      setMemberName(editingMember.memberName || '');
      setLevel(editingMember.level || 80);
      setClasse(editingMember.classe || 'Guerreiro');
      setDano(editingMember.dano || 0);
      setDefesa(editingMember.defesa || 0);
      setAcerto(editingMember.acerto || 95);
      setPower(editingMember.power || 0);
      setImgurUrl(editingMember.imgurUrl || '');
      setNotes(editingMember.notes || '');
    } else {
      setMemberName(activeUser);
      setLevel(80);
      setClasse('Guerreiro Berserker');
      setDano(4500);
      setDefesa(4200);
      setAcerto(95);
      setPower(calculateSuggestedPower(4500, 4200, 95, 80));
      setImgurUrl('');
      setNotes('');
    }
  }, [editingMember, isOpen, activeUser]);

  if (!isOpen) return null;

  const handleStatChange = (field: 'dano' | 'defesa' | 'acerto' | 'level', val: number) => {
    let newD = dano;
    let newDef = defesa;
    let newAc = acerto;
    let newLvl = level;

    if (field === 'dano') {
      newD = val;
      setDano(val);
    } else if (field === 'defesa') {
      newDef = val;
      setDefesa(val);
    } else if (field === 'acerto') {
      newAc = val;
      setAcerto(val);
    } else if (field === 'level') {
      newLvl = val;
      setLevel(val);
    }

    setPower(calculateSuggestedPower(newD, newDef, newAc, newLvl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        memberName: memberName.trim(),
        level: Number(level) || 80,
        classe: classe.trim() || 'Guerreiro',
        dano: Number(dano) || 0,
        defesa: Number(defesa) || 0,
        acerto: Number(acerto) || 0,
        power: Number(power) || 0,
        imgurUrl: imgurUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: editingMember?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingMember ? 'Atualizar Status de Combate' : 'Registrar Status do Membro'}
              </h2>
              <p className="text-xs text-slate-400">Dano, Defesa, Acerto e Power Geral da Guilda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Member Name & Quick Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nome do Membro / Nickname *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ex: LordeAres"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
              />
              <select
                onChange={(e) => {
                  if (e.target.value) setMemberName(e.target.value);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">Guilda...</option>
                {guildMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Level & Class Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nível (Level)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={level}
                onChange={(e) => handleStatChange('level', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Classe / Especialização
              </label>
              <input
                type="text"
                list="classes-list"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                placeholder="Ex: Paladino Sagrado..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <datalist id="classes-list">
                {COMMON_CLASSES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          {/* Combat Stats: Dano, Defesa, Acerto */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" />
                Dano *
              </label>
              <input
                type="number"
                min="0"
                required
                value={dano}
                onChange={(e) => handleStatChange('dano', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-black text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Defesa *
              </label>
              <input
                type="number"
                min="0"
                required
                value={defesa}
                onChange={(e) => handleStatChange('defesa', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" />
                Acerto (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={acerto}
                onChange={(e) => handleStatChange('acerto', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-black text-center"
              />
            </div>
          </div>

          {/* Power Score Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Power Total Estimado
                </span>
                <p className="text-[11px] text-slate-400">Calculado a partir de Dano + Defesa + Acerto + Lv</p>
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
              className="w-32 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-400 font-black text-right text-base focus:outline-none"
            />
          </div>

          {/* Imgur URL Print Verification */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-purple-400" />
              URL do Print no Imgur (Verificação de Status)
            </label>
            <input
              type="url"
              placeholder="https://i.imgur.com/exemplo.png ou https://imgur.com/..."
              value={imgurUrl}
              onChange={(e) => setImgurUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Cole o link do print do seu inventário/status para validação pelos líderes da guilda.
            </p>
          </div>

          {/* Notes / Carteira */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Observações / Discord / Carteira
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Tanque secundário, disponível após as 20h..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold text-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !memberName.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 disabled:opacity-50 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : editingMember ? 'Atualizar Status' : 'Salvar Status'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
