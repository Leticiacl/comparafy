// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"; // 🔥 Adicionando métodos do Firestore

const firebaseConfig = {
  apiKey: "AIzaSyD1rCUhbYR7UApioX8UvqBiyiLr_1UQKCI",
  authDomain: "comparafy.firebaseapp.com",
  projectId: "comparafy",
  storageBucket: "comparafy.appspot.com",
  messagingSenderId: "605554593459",
  appId: "1:605554593459:web:927294878e9317ecb2eac6",
  measurementId: "G-VE8E5YZXN0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Autenticação + Google Provider
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Firestore (banco de dados)
const db = getFirestore(app);

// Função para adicionar uma lista ao Firestore
const addListToFirestore = async (list) => {
  try {
    const docRef = await addDoc(collection(db, "lists"), list);
    console.log("Lista adicionada com ID: ", docRef.id);
  } catch (e) {
    console.error("Erro ao adicionar a lista: ", e);
  }
};

// Função para adicionar economia ao Firestore
export const addSavingsToFirestore = async (savings) => {
  try {
    const docRef = await addDoc(collection(db, "savings"), savings);
    console.log("Economia adicionada com ID: ", docRef.id);
  } catch (e) {
    console.error("Erro ao adicionar economia: ", e);
  }
};

// Função para obter economias do Firestore
export const getSavingsFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "savings"));
    const savings = querySnapshot.docs.map(doc => doc.data());
    return savings;
  } catch (e) {
    console.error("Erro ao buscar economias: ", e);
    return [];
  }
};

// Função para obter todas as listas do Firestore
export const getListsFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "lists"));
    const lists = querySnapshot.docs.map(doc => doc.data());
    return lists;
  } catch (e) {
    console.error("Erro ao buscar as listas: ", e);
    return [];
  }
};

// Exportação única das funções
export { auth, provider, db, addListToFirestore }; // Somente as funções necessárias
