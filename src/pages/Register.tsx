import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Cadastro realizado com sucesso!');
      sessionStorage.setItem('uid', auth.currentUser?.uid || '');
      navigate('/');
    } catch (error: any) {
      toast.error('Erro ao cadastrar: ' + error.message);
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
        Cadastre-se no Comparify
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

      {/* Botão Cadastrar */}
      <button
        onClick={handleRegister}
        className="bg-yellow-500 text-black font-semibold py-2 rounded-lg w-full max-w-sm shadow mb-4"
      >
        Cadastrar
      </button>

      {/* Link login */}
      <button
        onClick={() => navigate('/login')}
        className="text-sm text-blue-500 underline mt-2"
      >
        Já tenho uma conta
      </button>
    </div>
  );
};

export default Register;
