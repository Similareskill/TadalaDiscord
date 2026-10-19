import React from 'react';
import { 
  History, 
  Activity, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  UserCheck, 
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { ActivityLog, ShoppingHistory } from '../../types';

interface HistoryViewProps {
  logs: ActivityLog[];
  history: ShoppingHistory[];
  onClearLogs?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  logs,
  history,
  onClearLogs
}) => {
  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'item_create':
        return <PlusCircle className="w-4 h-4 text-indigo-400" />;
      case 'item_collect':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'item_delete':
        return <Trash2 className="w-4 h-4 text-rose-400" />;
      case 'boss_checkin':
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      case 'status_update':
        return <Activity className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Histórico & Logs da Guilda</h2>
            <p className="text-xs text-slate-400">Auditoria em tempo real de coletas, crafts e check-ins</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Activity Timeline */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Atividades Recentes</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">{logs.length} registros</span>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Nenhuma atividade registrada ainda. Itens adicionados ou coletados aparecerão aqui!
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 rounded-xl bg-slate-850/80 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {log.actor || 'Sistema'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Archived Craft Trips / History */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Crafts Finalizados</h3>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Nenhum lote de craft arquivado. Quando todos os itens da lista forem coletados, você pode arquivar o lote!
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                  <h4 className="font-bold text-white text-sm">{h.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>{h.totalItems} materiais</span>
                    <span>por {h.completedBy}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">
                    {h.itemsSummary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
