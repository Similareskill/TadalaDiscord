import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MemberStatus } from '../types';
import { INITIAL_MEMBERS_STATUS } from '../lib/seedData';

const COLLECTION_NAME = 'member_statuses';
const LOCAL_STORAGE_KEY = 'lista_craft_members_status_cache';

const getLocalStatuses = (): MemberStatus[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalStatuses = (statuses: MemberStatus[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(statuses));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
};

export const subscribeToMemberStatuses = (callback: (statuses: MemberStatus[]) => void) => {
  const cached = getLocalStatuses();
  if (cached.length > 0) {
    callback(cached);
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && cached.length === 0) {
          seedInitialStatuses().then(seeded => {
            if (seeded.length > 0) callback(seeded);
          });
          return;
        }

        const statuses: MemberStatus[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<MemberStatus, 'id'>)
        }));

        // Sort by Power descending (Guild Leaderboard order)
        statuses.sort((a, b) => (b.power || 0) - (a.power || 0));

        setLocalStatuses(statuses);
        callback(statuses);
      },
      (error) => {
        console.warn('Firestore member statuses listener error, using local cache:', error);
        if (cached.length === 0) {
          const seeds = INITIAL_MEMBERS_STATUS.map((s, idx) => ({
            ...s,
            id: `local-status-${idx}-${Date.now()}`
          }));
          setLocalStatuses(seeds);
          callback(seeds);
        } else {
          callback(cached);
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error starting member status listener, running offline:', err);
    if (cached.length === 0) {
      const seeds = INITIAL_MEMBERS_STATUS.map((s, idx) => ({
        ...s,
        id: `local-status-${idx}-${Date.now()}`
      }));
      setLocalStatuses(seeds);
      callback(seeds);
    } else {
      callback(cached);
    }
    return () => {};
  }
};

export const addMemberStatus = async (status: Omit<MemberStatus, 'id'>): Promise<string> => {
  const data = {
    ...status,
    createdAt: status.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore addMemberStatus error, fallback to local:', error);
    const id = `local-stat-${Date.now()}`;
    const current = getLocalStatuses();
    const updated = [{ id, ...data }, ...current];
    updated.sort((a, b) => (b.power || 0) - (a.power || 0));
    setLocalStatuses(updated);
    return id;
  }
};

export const updateMemberStatus = async (id: string, updates: Partial<MemberStatus>): Promise<void> => {
  const data = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.warn('Firestore updateMemberStatus error, fallback to local:', error);
    const current = getLocalStatuses();
    const updated = current.map(item => item.id === id ? { ...item, ...data } : item);
    updated.sort((a, b) => (b.power || 0) - (a.power || 0));
    setLocalStatuses(updated);
  }
};

export const deleteMemberStatus = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deleteMemberStatus error, fallback to local:', error);
    const current = getLocalStatuses();
    const updated = current.filter(item => item.id !== id);
    setLocalStatuses(updated);
  }
};

export const seedInitialStatuses = async (): Promise<MemberStatus[]> => {
  const seeded: MemberStatus[] = [];
  try {
    for (const stat of INITIAL_MEMBERS_STATUS) {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), stat);
      seeded.push({ id: docRef.id, ...stat });
    }
  } catch (err) {
    INITIAL_MEMBERS_STATUS.forEach((stat, index) => {
      seeded.push({
        ...stat,
        id: `seed-status-${index}-${Date.now()}`
      });
    });
    setLocalStatuses(seeded);
  }
  return seeded;
};
