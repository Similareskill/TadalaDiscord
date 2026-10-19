import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCheck, 
  Trash2, 
  Plus, 
  PackagePlus, 
  Hammer, 
  Coins, 
  PackageCheck, 
  Clock, 
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { ShoppingItem, ItemCategory } from '../../types';
import { ItemCard } from './ItemCard';

interface CraftViewProps {
  items: ShoppingItem[];
  activeUser: string;
  onToggleStatus: (item: ShoppingItem) => void;
  onQuantityChange: (item: ShoppingItem, newQty: number) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onBatchToggle: (ids: string[], newStatus: 'pendente' | 'no_carrinho') => void;
  onBatchDelete: (ids: string[]) => void;
  onOpenNewItem: () => void;
  onOpenPresets: () => void;
  onArchiveCompleted?: () => void;
}

const CATEGORIES: ('Todos' | ItemCategory)[] = [
  'Todos',
  'Material de Craft',
  'Comum',
  'Raro',
  'Épico',
  'Lendário'
];

export const CraftView: React.FC<CraftViewProps> = ({
  items,
  activeUser,
  onToggleStatus,
  onQuantityChange,
  onEdit,
  onDelete,
  onBatchToggle,
  onBatchDelete,
  onOpenNewItem,
  onOpenPresets,
  onArchiveCompleted
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ItemCategory>('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'no_carrinho'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search by name, brand/source, notes, or assignees
      const matchesSearch = 
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brandOrPreference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nameList?.some(n => n.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = 
        selectedCategory === 'Todos' || item.category === selectedCategory;

      // Status filter
      const matchesStatus = 
        statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchTerm, selectedCategory, statusFilter]);

  // Overall metrics
  const totalMaterialsCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const pendingCount = items.filter(it => it.status === 'pendente').length;
  const collectedCount = items.filter(it => it.status === 'no_carrinho').length;
  const progressPercent = items.length > 0 ? Math.round((collectedCount / items.length) * 100) : 0;
  const totalCost = items.reduce((acc, it) => acc + ((it.unitPrice || 0) * (it.quantity || 1)), 0);

  // Selection helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(it => it.id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Total Items & Progress */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Progresso da Lista</span>
            <span className="text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {collectedCount} <span className="text-sm font-semibold text-slate-400">/ {items.length} itens</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Total Quantity */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold mb-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Volume Total</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {totalMaterialsCount.toLocaleString('pt-BR')}
            <span className="text-xs font-semibold text-slate-400 ml-1">unidades</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Materiais somados</p>
        </div>

        {/* Pending Items */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 shadow-lg">
          <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>A Coletar / Craftar</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {pendingCount}
            <span className="text-xs font-semibold text-slate-400 ml-1">pendentes</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Necessários para forja</p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por material, receita, drop ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Tabs (Todos, Só Pendentes, Só Coletados) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700/80 self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('pendente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'pendente'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('no_carrinho')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'no_carrinho'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Coletados ({collectedCount})
            </button>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 no-scrollbar text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Floating / Sticky Batch Actions Bar (when items are selected) */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 p-3 sm:px-5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            <span className="font-bold text-white">materiais selecionados</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onBatchToggle(selectedIds, 'no_carrinho');
                setSelectedIds([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar Coletados</span>
            </button>

            <button
              onClick={() => {
                onBatchToggle(selectedIds, 'pendente');
                setSelectedIds([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-semibold text-xs transition"
            >
              <span>Voltar p/ Pendente</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Excluir ${selectedIds.length} itens selecionados?`)) {
                  onBatchDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 font-semibold text-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              title="Cancelar Seleção"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Select all toggle indicator */}
      {filteredItems.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <button
            onClick={handleSelectAll}
            className="hover:text-indigo-400 font-semibold transition flex items-center gap-1.5"
          >
            <input
              type="checkbox"
              checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
              onChange={handleSelectAll}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 cursor-pointer"
            />
            <span>{selectedIds.length === filteredItems.length ? 'Desmarcar Todos' : 'Selecionar Todos'} ({filteredItems.length})</span>
          </button>

          {collectedCount === items.length && items.length > 0 && onArchiveCompleted && (
            <button
              onClick={onArchiveCompleted}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Todos coletados! Arquivar lote de craft</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
            <Hammer className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">Nenhum material encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchTerm || selectedCategory !== 'Todos' || statusFilter !== 'all'
                ? 'Nenhum item corresponde aos filtros selecionados. Tente ajustar a busca.'
                : 'Sua lista de craft está vazia. Adicione materiais individuais ou importe kits pré-configurados!'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenNewItem}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Material</span>
            </button>
            <button
              onClick={onOpenPresets}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs transition"
            >
              <PackagePlus className="w-4 h-4 text-purple-400" />
              <span>Carregar Kit Pronto</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grid of Craft Item Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={handleToggleSelect}
              onToggleStatus={onToggleStatus}
              onQuantityChange={onQuantityChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
};
