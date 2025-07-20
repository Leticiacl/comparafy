// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
} from 'firebase/auth';
import { auth, provider } from '../services/firebase';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error: any) {
      toast.error('Erro no login: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error: any) {
      toast.error('Erro no login com Google: ' + error.message);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      navigate('/');
    } catch (error: any) {
      toast.error('Erro ao entrar como visitante: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <img src="/LOGO_REDUZIDA.png" alt="Logo Comparify" className="w-16 h-16 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bem-vindo ao Comparafy</h1>

      <input
        type="email"
        placeholder="Email"
        className="border border-gray-300 rounded-md p-2 w-full max-w-sm mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        className="border border-gray-300 rounded-md p-2 w-full max-w-sm mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleEmailLogin}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded w-full max-w-sm mb-3"
      >
        Entrar com Email
      </button>

      <button
        onClick={handleGoogleLogin}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded w-full max-w-sm mb-3"
      >
        Entrar com Google
      </button>

      <button
        onClick={handleAnonymousLogin}
        className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded w-full max-w-sm mb-4"
      >
        Continuar como visitante
      </button>

      <p className="text-sm text-blue-600">
        Ainda não tem conta?{' '}
        <span
          onClick={() => navigate('/register')}
          className="underline cursor-pointer"
        >
          Cadastre-se
        </span>
      </p>
    </div>
  );
};

export default Login;
