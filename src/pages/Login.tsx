import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { Mail, Lock, Google } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const loginComEmailSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      sessionStorage.setItem('userLogged', 'true');
      navigate('/dashboard');
    } catch (err: any) {
      setError('Erro ao fazer login. Verifique seu email e senha.');
    }
  };

  const loginComGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      sessionStorage.setItem('userLogged', 'true');
      navigate('/dashboard');
    } catch (err: any) {
      setError(`Erro no login com Google: ${err.message}`);
    }
  };

  const loginComoVisitante = async () => {
    try {
      await signInAnonymously(auth);
      sessionStorage.setItem('userLogged', 'true');
      navigate('/dashboard');
    } catch (err: any) {
      setError('Erro ao entrar como visitante.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <img src="/COMPARAFY.png" alt="Logo Comparify" className="w-40 mb-8" />

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Entrar no Comparify</h2>

      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4 text-sm w-full max-w-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={loginComEmailSenha} className="w-full max-w-sm space-y-4">
        <div className="flex items-center border rounded-lg px-3 py-2">
          <Mail className="text-gray-400 mr-2 w-5 h-5" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 outline-none text-sm"
          />
        </div>

        <div className="flex items-center border rounded-lg px-3 py-2">
          <Lock className="text-gray-400 mr-2 w-5 h-5" />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="flex-1 outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-xl transition"
        >
          Entrar
        </button>
      </form>

      <div className="flex items-center w-full max-w-sm my-4">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-3 text-gray-400 text-sm">ou</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <button
        onClick={loginComGoogle}
        className="w-full max-w-sm flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition"
      >
        <Google className="w-5 h-5" />
        Entrar com Google
      </button>

      <button
        onClick={loginComoVisitante}
        className="w-full max-w-sm mt-3 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition"
      >
        Continuar como visitante
      </button>

      <p className="mt-6 text-sm text-gray-500">
        Ainda não tem uma conta?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Cadastre-se
        </a>
      </p>
    </div>
  );
}
