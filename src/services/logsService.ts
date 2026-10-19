import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ActivityLog, ShoppingHistory, HouseholdMember } from '../types';
import { INITIAL_GUILD_MEMBERS } from '../lib/seedData';

const LOGS_COL = 'activity_logs';
const HISTORY_COL = 'shopping_history';
const MEMBERS_COL = 'household_members';

const LOCAL_LOGS = 'lista_craft_logs_cache';
const LOCAL_HISTORY = 'lista_craft_history_cache';
const LOCAL_ACTIVE_USER = 'lista_craft_active_user';

export const getActiveUser = (): string => {
  return localStorage.getItem(LOCAL_ACTIVE_USER) || 'LordeAres';
};

export const setActiveUser = (name: string): void => {
  localStorage.setItem(LOCAL_ACTIVE_USER, name);
};

export const subscribeToLogs = (callback: (logs: ActivityLog[]) => void) => {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS);
    if (raw) callback(JSON.parse(raw));
  } catch {}

  try {
    const q = query(collection(db, LOGS_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        const logs: ActivityLog[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ActivityLog, 'id'>)
        }));
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem(LOCAL_LOGS, JSON.stringify(logs));
        callback(logs);
      },
      (error) => {
        console.warn('Logs subscription error:', error);
      }
    );
  } catch (err) {
    return () => {};
  }
};

export const addActivityLog = async (log: Omit<ActivityLog, 'id'>): Promise<void> => {
  const logData = {
    ...log,
    timestamp: log.timestamp || new Date().toISOString()
  };

  try {
    await addDoc(collection(db, LOGS_COL), logData);
  } catch (err) {
    try {
      const raw = localStorage.getItem(LOCAL_LOGS);
      const current: ActivityLog[] = raw ? JSON.parse(raw) : [];
      const updated = [{ id: `log-${Date.now()}`, ...logData }, ...current].slice(0, 50);
      localStorage.setItem(LOCAL_LOGS, JSON.stringify(updated));
    } catch {}
  }
};

export const subscribeToHistory = (callback: (history: ShoppingHistory[]) => void) => {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY);
    if (raw) callback(JSON.parse(raw));
  } catch {}

  try {
    const q = query(collection(db, HISTORY_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        const history: ShoppingHistory[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ShoppingHistory, 'id'>)
        }));
        history.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        localStorage.setItem(LOCAL_HISTORY, JSON.stringify(history));
        callback(history);
      },
      (error) => {
        console.warn('History subscription error:', error);
      }
    );
  } catch (err) {
    return () => {};
  }
};

export const addShoppingHistory = async (history: Omit<ShoppingHistory, 'id'>): Promise<void> => {
  try {
    await addDoc(collection(db, HISTORY_COL), history);
  } catch (err) {
    try {
      const raw = localStorage.getItem(LOCAL_HISTORY);
      const current: ShoppingHistory[] = raw ? JSON.parse(raw) : [];
      const updated = [{ id: `history-${Date.now()}`, ...history }, ...current];
      localStorage.setItem(LOCAL_HISTORY, JSON.stringify(updated));
    } catch {}
  }
};

export const getGuildMembers = (): HouseholdMember[] => {
  try {
    const raw = localStorage.getItem('lista_craft_guild_members');
    return raw ? JSON.parse(raw) : INITIAL_GUILD_MEMBERS;
  } catch {
    return INITIAL_GUILD_MEMBERS;
  }
};

export const saveGuildMembers = (members: HouseholdMember[]): void => {
  localStorage.setItem('lista_craft_guild_members', JSON.stringify(members));
};
