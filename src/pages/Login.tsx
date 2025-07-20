import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
} from 'firebase/auth';
import { auth, provider } from '../services/firebase';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso!');
      sessionStorage.setItem('uid', auth.currentUser?.uid || '');
      navigate('/');
    } catch (error: any) {
      toast.error('Erro no login: ' + error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      sessionStorage.setItem('uid', user.uid);
      toast.success('Login com Google realizado!');
      navigate('/');
    } catch (error: any) {
      toast.error('Erro no login com Google: ' + error.message);
    }
  };

  const loginAsGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      sessionStorage.setItem('uid', result.user.uid);
      toast.success('Login como visitante realizado!');
      navigate('/');
    } catch (error: any) {
      toast.error('Erro no login anônimo: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      {/* Logo */}
      <img
        src="/COMPARAFY.png"
        alt="Logo Comparify"
        className="w-28 h-28 mb-6"
      />

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Entrar no Comparify
      </h1>

      {/* Email */}
      <div className="w-full max-w-sm mb-3 relative">
        <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
        <input
          type="email"
          placeholder="Email"
          className="pl-10 pr-4 py-2 border rounded-lg w-full text-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Senha */}
      <div className="w-full max-w-sm mb-4 relative">
        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
        <input
          type="password"
          placeholder="Senha"
          className="pl-10 pr-4 py-2 border rounded-lg w-full text-gray-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Botão Entrar */}
      <button
        onClick={loginWithEmail}
        className="bg-yellow-500 text-black font-semibold py-2 rounded-lg w-full max-w-sm shadow mb-4"
      >
        Entrar
      </button>

      {/* Separador */}
      <div className="flex items-center w-full max-w-sm my-2">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-2 text-sm text-gray-400">ou</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>

      {/* Botão Google */}
      <button
        onClick={loginWithGoogle}
        className="flex items-center justify-center gap-2 bg-white border py-2 rounded-lg w-full max-w-sm mb-3 shadow"
      >
        <FcGoogle size={20} />
        <span className="text-gray-700">Entrar com Google</span>
      </button>

      {/* Botão visitante */}
      <button
        onClick={loginAsGuest}
        className="bg-gray-100 text-gray-800 font-medium py-2 rounded-lg w-full max-w-sm mb-4"
      >
        Continuar como visitante
      </button>

      {/* Link cadastro */}
      <button
        onClick={() => navigate('/register')}
        className="text-sm text-blue-500 underline mt-2"
      >
        Cadastre-se
      </button>
    </div>
  );
};

export default Login;
