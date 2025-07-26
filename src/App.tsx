// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from "./services/firebase";
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Erro ao fazer login: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Login com Google realizado!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Erro no login com Google: ' + error.message);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      toast.success('Entrou como visitante!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Erro ao entrar como visitante: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-black">Login Comparify</h1>

      <input
        type="email"
        placeholder="E-mail"
        className="w-full max-w-sm px-4 py-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        className="w-full max-w-sm px-4 py-3 mb-5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <button
        onClick={handleEmailLogin}
        className="w-full max-w-sm bg-yellow-500 text-black font-bold py-3 mb-4 rounded-md shadow-md hover:bg-yellow-400 transition"
      >
        Entrar
      </button>

      <button
        onClick={handleGoogleLogin}
        className="w-full max-w-sm bg-red-500 text-white font-semibold py-3 mb-4 rounded-md hover:bg-red-400 transition"
      >
        Login com Google
      </button>

      <button
        onClick={handleAnonymousLogin}
        className="w-full max-w-sm bg-gray-400 text-black font-medium py-3 rounded-md hover:bg-gray-300 transition"
      >
        Continuar como Visitante
      </button>
    </div>
  );
}
