import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../services/firebase';
import {
  signInWithPopup,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { showToast } from '../components/ui/Toaster';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Login com Google
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      showToast('Login com Google realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro ao fazer login com Google.');
      console.error(error);
    }
  };

  // Login como visitante (anônimo)
  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
      showToast('Entrando como visitante...');
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro ao entrar como visitante.');
      console.error(error);
    }
  };

  // Login com email/senha
  const handleEmailLogin = async () => {
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast('Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Login realizado com sucesso!');
      }
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro no login ou criação de conta.');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Acessar o Comparify</h1>

      <input
        type="email"
        placeholder="E-mail"
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleEmailLogin} className="btn w-full">
        {isRegistering ? 'Criar conta' : 'Entrar com e-mail'}
      </button>

      <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-blue-500">
        {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Criar conta'}
      </button>

      <div className="w-full border-t my-4" />

      <button onClick={handleGoogleLogin} className="btn w-full bg-red-500 text-white">
        Entrar com Google
      </button>

      <button onClick={handleGuestLogin} className="btn w-full bg-gray-400 text-white">
        Entrar como visitante
      </button>
    </div>
  );
};

export default Login;