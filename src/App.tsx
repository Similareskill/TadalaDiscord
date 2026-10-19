/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  initAuth 
} from './lib/firebase';
import { 
  ShoppingItem, 
  MemberStatus, 
  BossEvent, 
  BossCheckin, 
  ActivityLog, 
  ShoppingHistory, 
  HouseholdMember 
} from './types';
import { 
  subscribeToItems, 
  addItem, 
  updateItem, 
  deleteItem, 
  batchToggleCollected, 
  batchDeleteItems,
  seedInitialItems 
} from './services/itemsService';
import { 
  subscribeToMemberStatuses, 
  addMemberStatus, 
  updateMemberStatus, 
  deleteMemberStatus,
  seedInitialStatuses 
} from './services/membersService';
import { 
  subscribeToBossEvents, 
  addBossEvent, 
  updateBossEvent, 
  deleteBossEvent, 
  subscribeToBossCheckins, 
  addBossCheckin,
  seedInitialBossEvents 
} from './services/bossService';
import { 
  subscribeToLogs, 
  addActivityLog, 
  subscribeToHistory, 
  addShoppingHistory, 
  getActiveUser, 
  setActiveUser as persistActiveUser, 
  getGuildMembers, 
  saveGuildMembers 
} from './services/logsService';

import { Navbar } from './components/Navbar';
import { CraftView } from './components/CraftList/CraftView';
import { ItemModal } from './components/CraftList/ItemModal';
import { PresetsModal } from './components/CraftList/PresetsModal';
import { MembersView } from './components/Members/MembersView';
import { MemberModal } from './components/Members/MemberModal';
import { ImgurViewerModal } from './components/Members/ImgurViewerModal';
import { BossView } from './components/Bosses/BossView';
import { BossModal } from './components/Bosses/BossModal';
import { HistoryView } from './components/HistoryLogs/HistoryView';
import { GuildView } from './components/GuildView';
import { ShareModal } from './components/ShareModal';

// Pleasant Web Audio sound synthesizer for physical feedback
const playAudioTone = (tone: 'check' | 'add' | 'checkin') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (tone === 'check') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (tone === 'add') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (tone === 'checkin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
};

export default function App() {
  // Navigation & User State
  const [currentTab, setCurrentTab] = useState<'craft' | 'members' | 'bosses' | 'history' | 'guild'>('craft');
  const [activeUser, setActiveUserState] = useState<string>('LordeAres');
  const [guildMembers, setGuildMembers] = useState<HouseholdMember[]>([]);

  // Real-time Data
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>([]);
  const [bossEvents, setBossEvents] = useState<BossEvent[]>([]);
  const [bossCheckins, setBossCheckins] = useState<BossCheckin[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [history, setHistory] = useState<ShoppingHistory[]>([]);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberStatus | null>(null);

  const [isImgurModalOpen, setIsImgurModalOpen] = useState(false);
  const [viewingImgurUrl, setViewingImgurUrl] = useState('');
  const [viewingImgurMember, setViewingImgurMember] = useState('');

  const [isBossModalOpen, setIsBossModalOpen] = useState(false);
  const [editingBoss, setEditingBoss] = useState<BossEvent | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Initialize Auth & Subscriptions
  useEffect(() => {
    initAuth();
    setActiveUserState(getActiveUser());
    setGuildMembers(getGuildMembers());

    const unsubItems = subscribeToItems(setItems);
    const unsubStatuses = subscribeToMemberStatuses(setMemberStatuses);
    const unsubBosses = subscribeToBossEvents(setBossEvents);
    const unsubCheckins = subscribeToBossCheckins(setBossCheckins);
    const unsubLogs = subscribeToLogs(setLogs);
    const unsubHistory = subscribeToHistory(setHistory);

    return () => {
      if (unsubItems) unsubItems();
      if (unsubStatuses) unsubStatuses();
      if (unsubBosses) unsubBosses();
      if (unsubCheckins) unsubCheckins();
      if (unsubLogs) unsubLogs();
      if (unsubHistory) unsubHistory();
    };
  }, []);

  const handleSelectActiveUser = (name: string) => {
    setActiveUserState(name);
    persistActiveUser(name);
  };

  // Item Handlers
  const handleToggleItemStatus = async (item: ShoppingItem) => {
    const nextStatus = item.status === 'pendente' ? 'no_carrinho' : 'pendente';
    playAudioTone(nextStatus === 'no_carrinho' ? 'check' : 'add');
    
    await updateItem(item.id, {
      status: nextStatus,
      collectedByName: nextStatus === 'no_carrinho' ? activeUser : undefined,
      collectedAt: nextStatus === 'no_carrinho' ? new Date().toISOString() : undefined
    });

    addActivityLog({
      type: nextStatus === 'no_carrinho' ? 'item_collect' : 'item_create',
      description: nextStatus === 'no_carrinho' 
        ? `${activeUser} marcou "${item.name}" (${item.quantity} ${item.unit}) como coletado.`
        : `${activeUser} moveu "${item.name}" de volta para pendente.`,
      actor: activeUser,
      timestamp: new Date().toISOString()
    });
  };

  const handleQuantityChange = async (item: ShoppingItem, newQty: number) => {
    await updateItem(item.id, { quantity: newQty });
  };

  const handleSaveItem = async (itemData: Omit<ShoppingItem, 'id'>) => {
    if (editingItem) {
      await updateItem(editingItem.id, itemData);
      addActivityLog({
        type: 'item_create',
        description: `${activeUser} editou o item "${itemData.name}".`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    } else {
      await addItem(itemData);
      playAudioTone('add');
      addActivityLog({
        type: 'item_create',
        description: `${activeUser} adicionou "${itemData.name}" (${itemData.quantity} ${itemData.unit}) à lista de craft.`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    }
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    const target = items.find(it => it.id === id);
    if (window.confirm(`Deseja remover "${target?.name || 'este item'}" da lista?`)) {
      await deleteItem(id);
      addActivityLog({
        type: 'item_delete',
        description: `${activeUser} removeu "${target?.name || 'Item'}" da lista de craft.`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleBatchToggle = async (ids: string[], newStatus: 'pendente' | 'no_carrinho') => {
    playAudioTone(newStatus === 'no_carrinho' ? 'check' : 'add');
    await batchToggleCollected(ids, newStatus, activeUser);
    addActivityLog({
      type: newStatus === 'no_carrinho' ? 'item_collect' : 'item_create',
      description: `${activeUser} marcou ${ids.length} materiais em massa como ${newStatus === 'no_carrinho' ? 'coletados' : 'pendentes'}.`,
      actor: activeUser,
      timestamp: new Date().toISOString()
    });
  };

  const handleBatchDelete = async (ids: string[]) => {
    await batchDeleteItems(ids);
    addActivityLog({
      type: 'item_delete',
      description: `${activeUser} excluiu ${ids.length} materiais em massa da lista.`,
      actor: activeUser,
      timestamp: new Date().toISOString()
    });
  };

  const handleAddPreset = async (presetItems: Omit<ShoppingItem, 'id'>[]) => {
    playAudioTone('add');
    for (const it of presetItems) {
      await addItem(it);
    }
    addActivityLog({
      type: 'item_create',
      description: `${activeUser} importou um kit de craft com ${presetItems.length} materiais.`,
      actor: activeUser,
      timestamp: new Date().toISOString()
    });
  };

  const handleArchiveCompleted = async () => {
    if (window.confirm('Deseja arquivar todos os materiais já coletados e registrar no histórico?')) {
      const collected = items.filter(it => it.status === 'no_carrinho');
      await addShoppingHistory({
        title: `Lote de Craft concluído em ${new Date().toLocaleDateString('pt-BR')}`,
        totalItems: collected.length,
        completedAt: new Date().toISOString(),
        completedBy: activeUser,
        itemsSummary: collected.map(c => `${c.quantity}x ${c.name}`).slice(0, 10).join(', ')
      });

      // Remove collected from active list
      const collectedIds = collected.map(c => c.id);
      await batchDeleteItems(collectedIds);

      addActivityLog({
        type: 'system',
        description: `${activeUser} finalizou e arquivou um lote com ${collected.length} materiais de craft.`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Member Status Handlers
  const handleSaveMemberStatus = async (statusData: Omit<MemberStatus, 'id'>) => {
    if (editingMember) {
      await updateMemberStatus(editingMember.id, statusData);
      addActivityLog({
        type: 'status_update',
        description: `${activeUser} atualizou o status de combate de "${statusData.memberName}".`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    } else {
      await addMemberStatus(statusData);
      addActivityLog({
        type: 'status_update',
        description: `${activeUser} registrou status de combate de "${statusData.memberName}" com ${statusData.power?.toLocaleString('pt-BR')} Power.`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    }
    setEditingMember(null);
  };

  const handleDeleteMemberStatus = async (id: string) => {
    const target = memberStatuses.find(m => m.id === id);
    if (window.confirm(`Deseja excluir o registro de status de "${target?.memberName}"?`)) {
      await deleteMemberStatus(id);
      addActivityLog({
        type: 'status_update',
        description: `${activeUser} excluiu o registro de combate de "${target?.memberName}".`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleViewImgur = (url: string, memberName: string) => {
    setViewingImgurUrl(url);
    setViewingImgurMember(memberName);
    setIsImgurModalOpen(true);
  };

  // Boss Event Handlers
  const handleSaveBoss = async (bossData: Omit<BossEvent, 'id'>) => {
    if (editingBoss) {
      await updateBossEvent(editingBoss.id, bossData);
      addActivityLog({
        type: 'system',
        description: `${activeUser} atualizou o evento do boss "${bossData.bossName}".`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    } else {
      await addBossEvent(bossData);
      addActivityLog({
        type: 'system',
        description: `${activeUser} agendou raid para "${bossData.bossName}".`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    }
    setEditingBoss(null);
  };

  const handleDeleteBoss = async (id: string) => {
    const target = bossEvents.find(b => b.id === id);
    if (window.confirm(`Deseja remover o boss "${target?.bossName}"?`)) {
      await deleteBossEvent(id);
      addActivityLog({
        type: 'system',
        description: `${activeUser} cancelou o agendamento de "${target?.bossName}".`,
        actor: activeUser,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleToggleBossStatus = async (boss: BossEvent, nextStatus: BossEvent['status']) => {
    await updateBossEvent(boss.id, { status: nextStatus });
    addActivityLog({
      type: 'system',
      description: `${activeUser} alterou o estado de "${boss.bossName}" para ${nextStatus}.`,
      actor: activeUser,
      timestamp: new Date().toISOString()
    });
  };

  const handleBossCheckin = async (boss: BossEvent) => {
    playAudioTone('checkin');
    await addBossCheckin({
      eventId: boss.id,
      bossName: boss.bossName,
      memberName: activeUser,
      checkinTime: new Date().toISOString(),
      points: 10,
      confirmed: true
    });

    addActivityLog({
      type: 'boss_checkin',
      description: `⚔️ ${activeUser} confirmou presença na Raid de "${boss.bossName}" (+10 pts no ranking)!`,
      actor: activeUser,
      timestamp: new Date().toISOString()
    });
  };

  // Guild Members Management
  const handleAddGuildMember = (newMember: HouseholdMember) => {
    const updated = [...guildMembers, newMember];
    setGuildMembers(updated);
    saveGuildMembers(updated);
  };

  const handleRemoveGuildMember = (id: string) => {
    const updated = guildMembers.filter(m => m.id !== id);
    setGuildMembers(updated);
    saveGuildMembers(updated);
  };

  const handleResetSeedData = async () => {
    await seedInitialItems();
    await seedInitialStatuses();
    await seedInitialBossEvents();
    window.location.reload();
  };

  // Computed metrics for header
  const pendingCount = items.filter(it => it.status === 'pendente').length;
  const totalCost = items.reduce((acc, it) => acc + ((it.unitPrice || 0) * (it.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeUser={activeUser}
        onSelectActiveUser={handleSelectActiveUser}
        guildMembers={guildMembers}
        onOpenNewItem={() => {
          setEditingItem(null);
          setIsItemModalOpen(true);
        }}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        pendingCount={pendingCount}
        totalCost={totalCost}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'craft' && (
          <CraftView
            items={items}
            activeUser={activeUser}
            onToggleStatus={handleToggleItemStatus}
            onQuantityChange={handleQuantityChange}
            onEdit={(item) => {
              setEditingItem(item);
              setIsItemModalOpen(true);
            }}
            onDelete={handleDeleteItem}
            onBatchToggle={handleBatchToggle}
            onBatchDelete={handleBatchDelete}
            onOpenNewItem={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            onOpenPresets={() => setIsPresetsModalOpen(true)}
            onArchiveCompleted={handleArchiveCompleted}
          />
        )}

        {currentTab === 'members' && (
          <MembersView
            members={memberStatuses}
            onOpenNewStatus={() => {
              setEditingMember(null);
              setIsMemberModalOpen(true);
            }}
            onEditStatus={(m) => {
              setEditingMember(m);
              setIsMemberModalOpen(true);
            }}
            onDeleteStatus={handleDeleteMemberStatus}
            onViewImgur={handleViewImgur}
          />
        )}

        {currentTab === 'bosses' && (
          <BossView
            bosses={bossEvents}
            checkins={bossCheckins}
            activeUser={activeUser}
            onOpenNewBoss={() => {
              setEditingBoss(null);
              setIsBossModalOpen(true);
            }}
            onCheckin={handleBossCheckin}
            onEditBoss={(b) => {
              setEditingBoss(b);
              setIsBossModalOpen(true);
            }}
            onDeleteBoss={handleDeleteBoss}
            onToggleStatus={handleToggleBossStatus}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            logs={logs}
            history={history}
          />
        )}

        {currentTab === 'guild' && (
          <GuildView
            guildMembers={guildMembers}
            onAddMember={handleAddGuildMember}
            onRemoveMember={handleRemoveGuildMember}
            activeUser={activeUser}
            onSelectActiveUser={handleSelectActiveUser}
            bossCheckins={bossCheckins}
            onResetSeedData={handleResetSeedData}
          />
        )}
      </main>

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        guildMembers={guildMembers}
        activeUser={activeUser}
      />

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onAddPreset={handleAddPreset}
        activeUser={activeUser}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMemberStatus}
        editingMember={editingMember}
        guildMembers={guildMembers}
        activeUser={activeUser}
      />

      <ImgurViewerModal
        isOpen={isImgurModalOpen}
        onClose={() => setIsImgurModalOpen(false)}
        imageUrl={viewingImgurUrl}
        memberName={viewingImgurMember}
      />

      <BossModal
        isOpen={isBossModalOpen}
        onClose={() => {
          setIsBossModalOpen(false);
          setEditingBoss(null);
        }}
        onSave={handleSaveBoss}
        editingBoss={editingBoss}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        items={items}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>Lista - Gestão de Craft & Guilda • Sincronização em tempo real via Firestore</p>
      </footer>

    </div>
  );
}
