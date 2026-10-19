import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ShoppingItem, ItemStatus } from '../types';
import { INITIAL_ITEMS } from '../lib/seedData';

const COLLECTION_NAME = 'shopping_items';
const LOCAL_STORAGE_KEY = 'lista_craft_shopping_items_cache';

// Local storage fallback helpers
const getLocalItems = (): ShoppingItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalItems = (items: ShoppingItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
};

export const subscribeToItems = (callback: (items: ShoppingItem[]) => void) => {
  // Pre-load from local storage immediately so UI is snappy
  const cached = getLocalItems();
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
          // If Firestore is completely empty on initial run, populate with initial items
          seedInitialItems().then((seeded) => {
            if (seeded.length > 0) callback(seeded);
          });
          return;
        }

        const items: ShoppingItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ShoppingItem, 'id'>)
        }));

        // Sort items: pendentes first, then by date
        items.sort((a, b) => {
          if (a.status !== b.status) {
            return a.status === 'pendente' ? -1 : 1;
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });

        setLocalItems(items);
        callback(items);
      },
      (error) => {
        console.warn('Firestore items subscription error, falling back to local mode:', error);
        // Fallback to local items or initial seeds
        if (cached.length === 0) {
          const seeds = INITIAL_ITEMS.map((item, idx) => ({
            ...item,
            id: `local-item-${idx}-${Date.now()}`
          }));
          setLocalItems(seeds);
          callback(seeds);
        } else {
          callback(cached);
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach Firestore listener, running offline:', err);
    if (cached.length === 0) {
      const seeds = INITIAL_ITEMS.map((item, idx) => ({
        ...item,
        id: `local-item-${idx}-${Date.now()}`
      }));
      setLocalItems(seeds);
      callback(seeds);
    } else {
      callback(cached);
    }
    return () => {};
  }
};

export const addItem = async (item: Omit<ShoppingItem, 'id'>): Promise<string> => {
  const itemData = {
    ...item,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), itemData);
    return docRef.id;
  } catch (error) {
    console.warn('Firestore addItem error, using local fallback:', error);
    const id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const current = getLocalItems();
    const updated = [{ id, ...itemData }, ...current];
    setLocalItems(updated);
    return id;
  }
};

export const updateItem = async (id: string, updates: Partial<ShoppingItem>): Promise<void> => {
  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.warn('Firestore updateItem error, using local fallback:', error);
    const current = getLocalItems();
    const updated = current.map(item => item.id === id ? { ...item, ...updateData } : item);
    setLocalItems(updated);
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore deleteItem error, using local fallback:', error);
    const current = getLocalItems();
    const updated = current.filter(item => item.id !== id);
    setLocalItems(updated);
  }
};

export const batchToggleCollected = async (
  ids: string[], 
  newStatus: ItemStatus,
  collectedByName?: string
): Promise<void> => {
  const updatePayload: Partial<ShoppingItem> = {
    status: newStatus,
    updatedAt: new Date().toISOString(),
    ...(newStatus === 'no_carrinho' 
      ? { 
          collectedByName: collectedByName || 'Membro da Guilda',
          collectedAt: new Date().toISOString()
        } 
      : { 
          collectedByName: undefined,
          collectedAt: undefined
        })
  };

  try {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const ref = doc(db, COLLECTION_NAME, id);
      batch.update(ref, updatePayload);
    });
    await batch.commit();
  } catch (error) {
    console.warn('Batch update fallback to local:', error);
    const current = getLocalItems();
    const updated = current.map(item => ids.includes(item.id) ? { ...item, ...updatePayload } : item);
    setLocalItems(updated);
  }
};

export const batchDeleteItems = async (ids: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const ref = doc(db, COLLECTION_NAME, id);
      batch.delete(ref);
    });
    await batch.commit();
  } catch (error) {
    console.warn('Batch delete fallback to local:', error);
    const current = getLocalItems();
    const updated = current.filter(item => !ids.includes(item.id));
    setLocalItems(updated);
  }
};

export const seedInitialItems = async (): Promise<ShoppingItem[]> => {
  const seededItems: ShoppingItem[] = [];
  try {
    for (const item of INITIAL_ITEMS) {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
      seededItems.push({ id: docRef.id, ...item });
    }
  } catch (err) {
    INITIAL_ITEMS.forEach((item, index) => {
      seededItems.push({
        ...item,
        id: `seed-${index}-${Date.now()}`
      });
    });
    setLocalItems(seededItems);
  }
  return seededItems;
};
