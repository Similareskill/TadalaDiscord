import React from 'react';
import { X, PackagePlus, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { CRAFT_PRESETS } from '../../lib/seedData';
import { ShoppingItem } from '../../types';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPreset: (presetItems: Omit<ShoppingItem, 'id'>[]) => Promise<void>;
  activeUser: string;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onAddPreset,
  activeUser
}) => {
  if (!isOpen) return null;

  const handleApplyPreset = async (preset: typeof CRAFT_PRESETS[0]) => {
    const itemsToAdd: Omit<ShoppingItem, 'id'>[] = preset.items.map(item => ({
      name: item.name,
      category: item.category,
      status: 'pendente',
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      packageInfo: preset.name,
      notes: `Adicionado via Kit: ${preset.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByName: activeUser
    }));

    await onAddPreset(itemsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Kits & Presets de Craft</h2>
              <p className="text-xs text-slate-400">Adicione listas pré-configuradas com 1 clique</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {CRAFT_PRESETS.map((preset, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-base">{preset.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">{preset.description}</p>
                
                {/* Items included pill list */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {preset.items.map((it, idx) => (
                    <span 
                      key={idx} 
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700"
                    >
                      {it.quantity} {it.unit} {it.name}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleApplyPreset(preset)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition active:scale-95 whitespace-nowrap self-end sm:self-center"
              >
                <span>Importar Kit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
