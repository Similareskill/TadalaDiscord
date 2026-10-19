import React from 'react';
import { 
  Check, 
  Minus, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  Coins, 
  Sparkles, 
  UserCheck, 
  ExternalLink,
  Tag
} from 'lucide-react';
import { ShoppingItem } from '../../types';

interface ItemCardProps {
  item: ShoppingItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (item: ShoppingItem) => void;
  onQuantityChange: (item: ShoppingItem, newQty: number) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onQuantityChange,
  onEdit,
  onDelete
}) => {
  const isCollected = item.status === 'no_carrinho';

  // Category styling based on rarity/type
  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'lendário':
        return {
          border: 'border-amber-500/40 hover:border-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          glow: 'group-hover:shadow-amber-500/10'
        };
      case 'épico':
        return {
          border: 'border-purple-500/40 hover:border-purple-400',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          glow: 'group-hover:shadow-purple-500/10'
        };
      case 'alquimia':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          glow: 'group-hover:shadow-emerald-500/10'
        };
      case 'consumível':
        return {
          border: 'border-cyan-500/40 hover:border-cyan-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          glow: 'group-hover:shadow-cyan-500/10'
        };
      case 'raro':
      case 'minério':
        return {
          border: 'border-blue-500/40 hover:border-blue-400',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          glow: 'group-hover:shadow-blue-500/10'
        };
      default:
        return {
          border: 'border-slate-700/80 hover:border-slate-600',
          badge: 'bg-slate-700/60 text-slate-300 border-slate-600',
          glow: 'group-hover:shadow-slate-700/10'
        };
    }
  };

  const theme = getCategoryTheme(item.category);
  const totalItemCost = (item.unitPrice || 0) * (item.quantity || 1);

  return (
    <div 
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden shadow-md ${
        isCollected 
          ? 'bg-slate-900/40 border-slate-800/80 opacity-75' 
          : `bg-slate-900/90 ${theme.border}`
      } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div className="p-4 sm:p-5 flex flex-col justify-between h-full gap-3">
        
        {/* Top bar: Selection checkbox, category badge, and status button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Multi-select check */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item.id)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              title="Selecionar para ações em massa"
            />
            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${theme.badge}`}>
              <Sparkles className="w-3 h-3" />
              {item.category}
            </span>
          </div>

          {/* Quick Collect Toggle Button */}
          <button
            onClick={() => onToggleStatus(item)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
              isCollected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white'
            }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center ${
              isCollected ? 'bg-emerald-500 text-slate-950 font-black' : 'border border-slate-500'
            }`}>
              {isCollected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>{isCollected ? 'Coletado' : 'Pendente'}</span>
          </button>
        </div>

        {/* Content body: Image & Name */}
        <div className="flex items-start gap-3.5">
          {/* Item thumbnail */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700/60 relative flex items-center justify-center">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                  isCollected ? 'grayscale' : ''
                }`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Package className="w-8 h-8 text-slate-600" />
            )}
          </div>

          {/* Title & metadata */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-base sm:text-lg tracking-tight leading-tight line-clamp-2 ${
              isCollected ? 'line-through text-slate-400' : 'text-white'
            }`}>
              {item.name}
            </h3>

            {item.packageInfo && (
              <p className="text-xs text-indigo-300 font-medium mt-0.5 line-clamp-1">
                📦 {item.packageInfo}
              </p>
            )}

            {item.brandOrPreference && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                🏷️ {item.brandOrPreference}
              </p>
            )}
          </div>
        </div>

        {/* Notes (if present) */}
        {item.notes && (
          <p className="text-xs text-slate-400 bg-slate-800/40 p-2 rounded-lg border border-slate-800 line-clamp-2 italic">
            "{item.notes}"
          </p>
        )}

        {/* Assignees badges */}
        {item.nameList && item.nameList.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium">Atribuído a:</span>
            {item.nameList.map((name, i) => (
              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                👤 {name}
              </span>
            ))}
          </div>
        )}

        {/* Collected by badge (if collected) */}
        {isCollected && item.collectedByName && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-900/40">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Coletado por <strong>{item.collectedByName}</strong></span>
          </div>
        )}

        {/* Bottom controls: Quantity stepper, unit price, and action buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
          
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => onQuantityChange(item, Math.max(1, (item.quantity || 1) - 1))}
              className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition active:scale-90"
              title="Diminuir"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="px-2 text-center">
              <span className="text-sm font-black text-white">{item.quantity}</span>
              <span className="text-[11px] text-slate-400 ml-1 font-medium">{item.unit || 'un'}</span>
            </div>
            <button
              onClick={() => onQuantityChange(item, (item.quantity || 1) + 1)}
              className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition active:scale-90"
              title="Aumentar"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Price information */}
          {item.unitPrice ? (
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-amber-400 font-extrabold text-xs sm:text-sm">
                <Coins className="w-3.5 h-3.5" />
                <span>{totalItemCost.toLocaleString('pt-BR')} 🪙</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {item.unitPrice.toLocaleString('pt-BR')} / {item.unit}
              </p>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">Sem custo definido</div>
          )}

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Editar Item"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
              title="Excluir Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
