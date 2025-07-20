// src/pages/Register.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/ui/Toaster';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem('userId', auth.currentUser?.uid || '');
      showToast.success('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (error: any) {
      showToast.error('Erro ao cadastrar: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">Cadastre-se no Comparafy</h1>

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

      <button
        onClick={handleRegister}
        className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold w-full max-w-md"
      >
        Cadastrar
      </button>

      <button
        onClick={() => navigate('/login')}
        className="text-blue-500 underline"
      >
        Já tenho uma conta
      </button>
    </div>
  );
};

export default Register;
