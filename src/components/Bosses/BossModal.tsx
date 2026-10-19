import React, { useState, useEffect } from 'react';
import { X, Skull, MapPin, Flame, Gift, Save } from 'lucide-react';
import { BossEvent } from '../../types';

interface BossModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<BossEvent, 'id'>) => Promise<void>;
  editingBoss?: BossEvent | null;
}

export const BossModal: React.FC<BossModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBoss
}) => {
  const [bossName, setBossName] = useState('');
  const [spawnTime, setSpawnTime] = useState('');
  const [location, setLocation] = useState('');
  const [minPower, setMinPower] = useState(100000);
  const [rewards, setRewards] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<BossEvent['status']>('agendado');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingBoss) {
      setBossName(editingBoss.bossName || '');
      // Format to datetime-local string (YYYY-MM-DDTHH:mm)
      try {
        const d = new Date(editingBoss.spawnTime);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setSpawnTime(localIso);
      } catch {
        setSpawnTime('');
      }
      setLocation(editingBoss.location || '');
      setMinPower(editingBoss.minPower || 100000);
      setRewards(editingBoss.rewards || '');
      setNotes(editingBoss.notes || '');
      setStatus(editingBoss.status || 'agendado');
    } else {
      setBossName('');
      // Default to 4 hours from now
      const d = new Date(Date.now() + 3600000 * 4);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setSpawnTime(localIso);
      setLocation('');
      setMinPower(100000);
      setRewards('');
      setNotes('');
      setStatus('agendado');
    }
  }, [editingBoss, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bossName.trim() || !spawnTime) return;

    setIsSubmitting(true);
    try {
      await onSave({
        bossName: bossName.trim(),
        spawnTime: new Date(spawnTime).toISOString(),
        location: location.trim() || 'Local Desconhecido',
        minPower: Number(minPower) || 90000,
        rewards: rewards.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
        createdAt: editingBoss?.createdAt || new Date().toISOString()
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
              <Skull className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingBoss ? 'Editar Evento de Boss' : 'Agendar Novo Boss / Raid'}
              </h2>
              <p className="text-xs text-slate-400">Defina o timer de spawn e os drops da raid</p>
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
          
          {/* Boss Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nome do Boss *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Dragão Valakas, Rainha das Aranhas, Baium..."
              value={bossName}
              onChange={(e) => setBossName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-bold"
            />
          </div>

          {/* Spawn Time & Min Power */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Data & Hora de Spawn *
              </label>
              <input
                type="datetime-local"
                required
                value={spawnTime}
                onChange={(e) => setSpawnTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                Power Mínimo Recomendado
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={minPower}
                onChange={(e) => setMinPower(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              Localização no Mapa
            </label>
            <input
              type="text"
              placeholder="Ex: Vale do Silêncio, Covil dos Dragões..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* Rewards */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-purple-400" />
              Recompensas & Drops Chave
            </label>
            <input
              type="text"
              placeholder="Ex: Armas Grau S, Pedras Divinas, Joias de Raid..."
              value={rewards}
              onChange={(e) => setRewards(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Estado Atual
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['agendado', 'em_andamento', 'derrotado'] as const).map(st => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition ${
                    status === st
                      ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Instruções de Estratégia
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Grupo 1 foca no Boss, Grupo 2 controla os adds..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          {/* Submit */}
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
              disabled={isSubmitting || !bossName.trim() || !spawnTime}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 disabled:opacity-50 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : editingBoss ? 'Atualizar Evento' : 'Agendar Raid'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
