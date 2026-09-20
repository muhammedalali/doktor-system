import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGiCtOPCHxhJ28mhXXtVCowGDsVeireUQ",
  authDomain: "doktro-3082a.firebaseapp.com",
  projectId: "doktro-3082a",
  storageBucket: "doktro-3082a.firebasestorage.app",
  messagingSenderId: "1029035147884",
  appId: "1:1029035147884:web:8c4eb3c772053f2330ce49",
  measurementId: "G-0ZBHQ0PV9P"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);