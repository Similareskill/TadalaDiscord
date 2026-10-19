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
import { BossEvent, BossCheckin } from '../types';
import { INITIAL_BOSS_EVENTS } from '../lib/seedData';

const BOSS_EVENTS_COL = 'boss_events';
const BOSS_CHECKINS_COL = 'boss_checkins';
const LOCAL_STORAGE_EVENTS = 'lista_craft_boss_events_cache';
const LOCAL_STORAGE_CHECKINS = 'lista_craft_boss_checkins_cache';

const getLocalEvents = (): BossEvent[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalEvents = (events: BossEvent[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
};

const getLocalCheckins = (): BossCheckin[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHECKINS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalCheckins = (checkins: BossCheckin[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHECKINS, JSON.stringify(checkins));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
};

export const subscribeToBossEvents = (callback: (events: BossEvent[]) => void) => {
  const cached = getLocalEvents();
  if (cached.length > 0) {
    callback(cached);
  }

  try {
    const colRef = collection(db, BOSS_EVENTS_COL);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && cached.length === 0) {
          seedInitialBossEvents().then(seeded => {
            if (seeded.length > 0) callback(seeded);
          });
          return;
        }

        const events: BossEvent[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<BossEvent, 'id'>)
        }));

        // Sort by spawnTime ascending (soonest first)
        events.sort((a, b) => new Date(a.spawnTime).getTime() - new Date(b.spawnTime).getTime());

        setLocalEvents(events);
        callback(events);
      },
      (error) => {
        console.warn('Firestore boss events listener error, using local fallback:', error);
        if (cached.length === 0) {
          const seeds = INITIAL_BOSS_EVENTS.map((e, idx) => ({
            ...e,
            id: `local-boss-${idx}-${Date.now()}`
          }));
          setLocalEvents(seeds);
          callback(seeds);
        } else {
          callback(cached);
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error starting boss events listener:', err);
    if (cached.length === 0) {
      const seeds = INITIAL_BOSS_EVENTS.map((e, idx) => ({
        ...e,
        id: `local-boss-${idx}-${Date.now()}`
      }));
      setLocalEvents(seeds);
      callback(seeds);
    } else {
      callback(cached);
    }
    return () => {};
  }
};

export const addBossEvent = async (event: Omit<BossEvent, 'id'>): Promise<string> => {
  const data = {
    ...event,
    createdAt: event.createdAt || new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, BOSS_EVENTS_COL), data);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore addBossEvent fallback to local:', error);
    const id = `local-boss-${Date.now()}`;
    const current = getLocalEvents();
    const updated = [...current, { id, ...data }];
    updated.sort((a, b) => new Date(a.spawnTime).getTime() - new Date(b.spawnTime).getTime());
    setLocalEvents(updated);
    return id;
  }
};

export const updateBossEvent = async (id: string, updates: Partial<BossEvent>): Promise<void> => {
  try {
    const docRef = doc(db, BOSS_EVENTS_COL, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn('Firestore updateBossEvent fallback to local:', error);
    const current = getLocalEvents();
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    setLocalEvents(updated);
  }
};

export const deleteBossEvent = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, BOSS_EVENTS_COL, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deleteBossEvent fallback to local:', error);
    const current = getLocalEvents();
    const updated = current.filter(item => item.id !== id);
    setLocalEvents(updated);
  }
};

export const subscribeToBossCheckins = (callback: (checkins: BossCheckin[]) => void) => {
  const cached = getLocalCheckins();
  if (cached.length > 0) {
    callback(cached);
  }

  try {
    const colRef = collection(db, BOSS_CHECKINS_COL);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const checkins: BossCheckin[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<BossCheckin, 'id'>)
        }));

        setLocalCheckins(checkins);
        callback(checkins);
      },
      (error) => {
        console.warn('Firestore checkins listener error:', error);
        callback(cached);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error starting checkins listener:', err);
    callback(cached);
    return () => {};
  }
};

export const addBossCheckin = async (checkin: Omit<BossCheckin, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, BOSS_CHECKINS_COL), checkin);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore addBossCheckin fallback to local:', error);
    const id = `local-checkin-${Date.now()}`;
    const current = getLocalCheckins();
    const updated = [{ id, ...checkin }, ...current];
    setLocalCheckins(updated);
    return id;
  }
};

export const seedInitialBossEvents = async (): Promise<BossEvent[]> => {
  const seeded: BossEvent[] = [];
  try {
    for (const event of INITIAL_BOSS_EVENTS) {
      const docRef = await addDoc(collection(db, BOSS_EVENTS_COL), event);
      seeded.push({ id: docRef.id, ...event });
    }
  } catch (err) {
    INITIAL_BOSS_EVENTS.forEach((e, index) => {
      seeded.push({
        ...e,
        id: `seed-boss-${index}-${Date.now()}`
      });
    });
    setLocalEvents(seeded);
  }
  return seeded;
};
