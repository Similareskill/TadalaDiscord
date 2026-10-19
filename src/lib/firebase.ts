import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const firebaseConfig = firebaseAppletConfig || {
  projectId: "cedar-arena-zcbh2",
  appId: "1:642179568577:web:abdc8c12b7902eaec7d540",
  apiKey: "AIzaSyAnQelUngjld7yLuVv3F7A8egYD6gU16EM",
  authDomain: "cedar-arena-zcbh2.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-listagestodecomp-57125af2-977b-4118-a596-624d58f97b29",
  storageBucket: "cedar-arena-zcbh2.firebasestorage.app",
  messagingSenderId: "642179568577"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore targeting the specific custom databaseId
let firestoreInstance;
try {
  const databaseId = (firebaseConfig as any).firestoreDatabaseId && (firebaseConfig as any).firestoreDatabaseId !== '(default)'
    ? (firebaseConfig as any).firestoreDatabaseId
    : undefined;
  
  if (databaseId) {
    firestoreInstance = getFirestore(app, databaseId);
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch (err) {
  console.warn('Fallback to standard firestore initialization:', err);
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// Ensure anonymous sign-in for seamless multi-user collaboration
export const initAuth = async () => {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser;
  } catch (error) {
    console.warn('Anonymous auth failed or offline, continuing in guest mode:', error);
    return null;
  }
};
