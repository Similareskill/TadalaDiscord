import React, { useState, useEffect } from 'react';
import { X, Sparkles, Image, Package, Coins, Users, Save } from 'lucide-react';
import { ShoppingItem, ItemCategory, HouseholdMember } from '../../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<ShoppingItem, 'id'>) => Promise<void>;
  editingItem?: ShoppingItem | null;
  guildMembers: HouseholdMember[];
  activeUser: string;
}

const CATEGORIES: ItemCategory[] = [
  'Material de Craft',
  'Comum',
  'Raro',
  'Épico',
  'Lendário'
];

const COMMON_UNITS = ['un', 'barras', 'frascos', 'gemas', 'packs', 'toras', 'kg', 'g'];

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  guildMembers,
  activeUser
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Material de Craft');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('un');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [packageInfo, setPackageInfo] = useState('');
  const [brandOrPreference, setBrandOrPreference] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setCategory((editingItem.category as ItemCategory) || 'Material de Craft');
      setQuantity(editingItem.quantity || 1);
      setUnit(editingItem.unit || 'un');
      setUnitPrice(editingItem.unitPrice !== undefined ? editingItem.unitPrice : '');
      setPackageInfo(editingItem.packageInfo || '');
      setBrandOrPreference(editingItem.brandOrPreference || '');
      setNotes(editingItem.notes || '');
      setImageUrl(editingItem.imageUrl || '');
      setSelectedAssignees(editingItem.nameList || []);
    } else {
      setName('');
      setCategory('Material de Craft');
      setQuantity(1);
      setUnit('un');
      setUnitPrice('');
      setPackageInfo('');
      setBrandOrPreference('');
      setNotes('');
      setImageUrl('');
      setSelectedAssignees([activeUser]);
    }
  }, [editingItem, isOpen, activeUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        category,
        status: editingItem ? editingItem.status : 'pendente',
        quantity: Math.max(1, Number(quantity) || 1),
        unit: unit.trim() || 'un',
        unitPrice: unitPrice === '' ? undefined : Number(unitPrice),
        packageInfo: packageInfo.trim() || undefined,
        brandOrPreference: brandOrPreference.trim() || undefined,
        notes: notes.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        nameList: selectedAssignees.length > 0 ? selectedAssignees : undefined,
        createdAt: editingItem?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByName: editingItem?.createdByName || activeUser,
        collectedByName: editingItem?.collectedByName,
        collectedAt: editingItem?.collectedAt
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssignee = (memberName: string) => {
    setSelectedAssignees(prev => 
      prev.includes(memberName) 
        ? prev.filter(n => n !== memberName)
        : [...prev, memberName]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingItem ? 'Editar Item de Craft' : 'Novo Item de Craft / Compra'}
              </h2>
              <p className="text-xs text-slate-400">Preencha os detalhes do material necessário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nome do Item / Material *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Lingote de Mithril, Poção Maior de HP..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>

          {/* Category & Quantity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Categoria / Raridade
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Unidade
                </label>
                <input
                  type="text"
                  placeholder="un, barras..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  list="units-list"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <datalist id="units-list">
                  {COMMON_UNITS.map(u => <option key={u} value={u} />)}
                </datalist>
              </div>
            </div>
          </div>

          {/* Unit Price & Package/Recipe info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Preço Unitário (Moedas)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 120"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                Info de Pacote / Refino
              </label>
              <input
                type="text"
                placeholder="Ex: Forja Real Lv.4, Pack 50..."
                value={packageInfo}
                onChange={(e) => setPackageInfo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Source / Recipe / Brand */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Origem de Coleta / Local / Receita
            </label>
            <input
              type="text"
              placeholder="Ex: Mina dos Anões, Drop de Valakas, NPC de Giran..."
              value={brandOrPreference}
              onChange={(e) => setBrandOrPreference(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Image URL & Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-purple-400" />
              URL da Imagem / Ícone
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://imgur.com/..., https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
              {imageUrl && (
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Observações / Instruções
            </label>
            <textarea
              rows={2}
              placeholder="Notas adicionais para a guilda..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Assignees (Membros Atribuídos) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Membros Responsáveis pela Coleta
            </label>
            <div className="flex flex-wrap gap-2">
              {guildMembers.map(m => {
                const isSelected = selectedAssignees.includes(m.name);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleAssignee(m.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{m.avatar || '👤'}</span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
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
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Criar Item'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
