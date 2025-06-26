// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../services/firebase';
import { signInWithPopup, signInAnonymously } from 'firebase/auth';
import { AtSignIcon, LockIcon } from 'lucide-react';
import { showToast } from '../components/ui/Toaster';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      sessionStorage.setItem('userId', user.uid);
      showToast('Login com Google realizado com sucesso!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro ao fazer login com Google', 'error');
    }
  };

  const handleVisitanteLogin = async () => {
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      sessionStorage.setItem('userId', user.uid);
      showToast('Você entrou como visitante.', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro ao entrar como visitante', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white dark:bg-black">
      <img src="/COMPARAFY.png" alt="Logo Comparify" className="w-40 mb-6" />
      <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4">Entre com sua conta</h2>

      <div className="w-full max-w-sm space-y-4">
        <div className="relative">
          <AtSignIcon className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="email"
            placeholder="E-mail"
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-md">
          Entrar
        </button>

        <div className="flex items-center justify-center my-2">
          <div className="border-t border-gray-300 flex-grow mr-3" />
          <span className="text-gray-500">ou</span>
          <div className="border-t border-gray-300 flex-grow ml-3" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 border border-gray-300 rounded-md flex items-center justify-center gap-2"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          <span className="text-sm font-medium">Continuar com Google</span>
        </button>

        <button
          onClick={handleVisitanteLogin}
          className="w-full py-3 bg-gray-100 text-gray-800 font-medium rounded-md"
        >
          Continuar como visitante
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Não tem uma conta?{' '}
          <span className="text-yellow-600 font-medium cursor-pointer">
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;