// src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, provider } from '../services/firebase';
import { showToast } from '../components/ui/Toaster';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, senha);
      sessionStorage.setItem('userId', result.user.uid);
      showToast('Login realizado com sucesso', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Falha no login com e-mail', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      sessionStorage.setItem('userId', result.user.uid);
      showToast('Login com Google bem-sucedido', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro ao entrar com Google', 'error');
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      const result = await signInAnonymously(auth);
      sessionStorage.setItem('userId', result.user.uid);
      showToast('Login como visitante realizado', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro ao entrar como visitante', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Acessar o Comparify</h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-400 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-400 dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleEmailLogin}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
          >
            Entrar com e-mail
          </button>
          <p className="text-sm text-center">
            Não tem conta? <span className="text-blue-600 cursor-pointer">Criar conta</span>
          </p>
          <div className="border-t border-gray-300 my-4" />
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition"
          >
            Entrar com Google
          </button>
          <button
            onClick={handleAnonymousLogin}
            className="w-full bg-gray-400 text-white py-3 rounded-md hover:bg-gray-500 transition"
          >
            Entrar como visitante
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
