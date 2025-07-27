import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebase';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      sessionStorage.setItem('user', JSON.stringify(userCredential.user));
      toast.success('Login realizado com sucesso');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login.');
    }
  };

  const loginComGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      toast.success('Login com Google realizado');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao logar com Google.');
    }
  };

  const loginVisitante = async () => {
    try {
      const result = await signInAnonymously(auth);
      sessionStorage.setItem('user', JSON.stringify(result.user));
      toast.success('Login como visitante');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao entrar como visitante.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <img
        src="/COMPARAFY.png"
        alt="Logo"
        className="w-36 h-auto object-contain mb-6"
      />

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Entre com sua conta</h2>

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-md mb-3 px-4 py-3 border rounded-xl text-gray-800"
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="w-full max-w-md mb-4 px-4 py-3 border rounded-xl text-gray-800"
      />

      <button
        onClick={handleLogin}
        className="w-full max-w-md bg-yellow-400 text-black font-semibold py-3 rounded-xl mb-4"
      >
        Entrar
      </button>

      <div className="flex items-center justify-center w-full max-w-md my-2">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-400">ou</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        onClick={loginComGoogle}
        className="w-full max-w-md bg-white border border-gray-300 text-black font-semibold py-3 rounded-xl mb-3 shadow"
      >
        Continuar com Google
      </button>

      <button
        onClick={loginVisitante}
        className="w-full max-w-md bg-gray-100 text-black font-semibold py-3 rounded-xl"
      >
        Continuar como visitante
      </button>

      <p className="mt-6 text-sm text-gray-600">
        Não tem uma conta?{' '}
        <span
          className="text-yellow-500 font-semibold cursor-pointer"
          onClick={() => navigate('/register')}
        >
          Cadastre-se
        </span>
      </p>
    </div>
  );
};

export default Login;
