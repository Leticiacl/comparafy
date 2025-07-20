// src/pages/Register.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (error: any) {
      toast.error('Erro ao cadastrar: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      <img src="/LOGO_REDUZIDA.png" alt="Logo Comparify" className="w-16 h-16 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastre-se no Comparafy</h1>

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
        onClick={handleRegister}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded w-full max-w-sm mb-3"
      >
        Cadastrar
      </button>

      <button
        onClick={() => navigate('/login')}
        className="text-blue-600 underline text-sm"
      >
        Já tenho uma conta
      </button>
    </div>
  );
};

export default Register;
