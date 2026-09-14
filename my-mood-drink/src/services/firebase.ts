import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Pull config from env vars (Vite: import.meta.env, Next.js: process.env with
// NEXT_PUBLIC_ prefix). Never hardcode these in the repo.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// getApps() guard avoids "app already initialized" during hot reload.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
