// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 🔥 Adicionando o Firestore

const firebaseConfig = {
  apiKey: "AIzaSyD1rCUhbYR7UApioX8UvqBiyiLr_1UQKCI",
  authDomain: "comparafy.firebaseapp.com",
  projectId: "comparafy",
  storageBucket: "comparafy.appspot.com",
  messagingSenderId: "605554593459",
  appId: "1:605554593459:web:927294878e9317ecb2eac6",
  measurementId: "G-VE8E5YZXN0"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Autenticação + Google Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Firestore (banco de dados)
const db = getFirestore(app);

export { auth, provider, db };
