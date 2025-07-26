import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth, provider, signInAnonymously } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, senha);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Erro ao fazer login. Verifique os dados.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      toast.success('Login com Google bem-sucedido!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Erro ao fazer login com Google.');
    }
  };

  const handleGuestLogin = async () => {
    try {
      const result = await signInAnonymously(auth);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      toast.success('Entrando como visitante...');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Erro ao entrar como visitante.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Login Comparify</h1>
      <input
        type="email"
        placeholder="E-mail"
        className="border w-full max-w-md p-3 rounded mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        className="border w-full max-w-md p-3 rounded mb-6"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <button
        onClick={handleEmailLogin}
        className="w-full max-w-md bg-yellow-500 text-black font-semibold py-3 rounded mb-4"
      >
        Entrar
      </button>
      <button
        onClick={handleGoogleLogin}
        className="w-full max-w-md bg-red-500 text-white font-semibold py-3 rounded mb-4"
      >
        Login com Google
      </button>
      <button
        onClick={handleGuestLogin}
        className="w-full max-w-md bg-gray-400 text-black font-semibold py-3 rounded"
      >
        Continuar como Visitante
      </button>
    </div>
  );
}
