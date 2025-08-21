// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInAnonymously,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Dica: normalmente é PROJECT_ID.appspot.com
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // corrigido o nome da env:
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Provider do Google
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function ensureAnonymousSession(): Promise<string> {
  let user = auth.currentUser;
  if (!user) {
    const cred = await signInAnonymously(auth);
    user = cred.user;
  }
  sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
  sessionStorage.setItem("userId", user.uid);
  sessionStorage.setItem("authType", "anonymous");
  return user.uid;
}
