// Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInAnonymously, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../services/firebase';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao fazer login: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success('Login com Google realizado!');
      navigate('/');
    } catch (error) {
      toast.error('Erro no login com Google: ' + error.message);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      toast.success('Login como visitante realizado!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao entrar como visitante: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">Entrar no Comparafy</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded w-full max-w-md"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        className="border p-2 rounded w-full max-w-md"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleEmailLogin} className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold w-full max-w-md">
        Entrar
      </button>

      <button onClick={handleGoogleLogin} className="bg-red-500 text-white px-4 py-2 rounded font-semibold w-full max-w-md">
        Entrar com Google
      </button>

      <button onClick={handleAnonymousLogin} className="bg-gray-700 text-white px-4 py-2 rounded font-semibold w-full max-w-md">
        Continuar como visitante
      </button>

      <button onClick={() => navigate('/register')} className="text-blue-500 underline">
        Cadastre-se
      </button>
    </div>
  );
};

export default Login;