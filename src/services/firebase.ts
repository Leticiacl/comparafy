// Importações das bibliotecas necessárias do Firebase
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase (substitua pelos seus dados reais)
const firebaseConfig = {
  apiKey: "AIzaSyD1rCUhbYR7UApioX8UvqBiyiLr_1UQKCI",
  authDomain: "comparafy.firebaseapp.com",
  projectId: "comparafy",
  storageBucket: "comparafy.appspot.com",
  messagingSenderId: "605554593459",
  appId: "1:605554593459:web:927294878e9317ecb2eac6",
  measurementId: "G-VE8E5YZXN0"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Inicializando o Firebase Authentication
const auth = getAuth(app);

// Inicializando o provedor do Google para autenticação
const provider = new GoogleAuthProvider();

// Inicializando o Firestore (Banco de dados NoSQL)
const db = getFirestore(app);

// Exportando os objetos para serem usados em outros arquivos
export { auth, provider, db };
