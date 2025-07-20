// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
} from 'firebase/auth';
import { auth, provider } from '../services/firebase';
import { showToast } from '../components/ui/Toaster';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem('userId', auth.currentUser?.uid || '');
      showToast.success('Login com email realizado!');
      navigate('/');
    } catch (error: any) {
      showToast.error('Erro no login com email: ' + error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      sessionStorage.setItem('userId', auth.currentUser?.uid || '');
      showToast.success('Login com Google realizado!');
      navigate('/');
    } catch (error: any) {
      showToast.error('Erro no login com Google: ' + error.message);
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
      sessionStorage.setItem('userId', auth.currentUser?.uid || '');
      showToast.success('Login como visitante realizado!');
      navigate('/');
    } catch (error: any) {
      showToast.error('Erro ao logar como visitante: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h1 className="text-2xl font-bold">Bem-vindo ao Comparafy</h1>

      <div className="flex flex-col gap-3 w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={loginWithEmail} className="bg-yellow-500 text-black font-semibold py-2 rounded">
          Entrar com Email
        </button>

        <button onClick={loginWithGoogle} className="bg-red-500 text-white font-semibold py-2 rounded">
          Entrar com Google
        </button>

        <button onClick={loginAsGuest} className="bg-gray-700 text-white font-semibold py-2 rounded">
          Continuar como visitante
        </button>

        <button
          onClick={() => navigate('/register')}
          className="text-blue-600 underline text-sm"
        >
          Ainda não tem conta? Cadastre-se
        </button>
      </div>
    </div>
  );
};

export default Login;
