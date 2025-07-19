// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { showToast } from '../components/ui/Toaster';
import { AtSignIcon, LockIcon } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, senha);
      sessionStorage.setItem('userId', result.user.uid);
      showToast('Cadastro realizado com sucesso!', 'success');
      navigate('/');
    } catch (error: any) {
      console.error('Erro no cadastro:', error.message);
      showToast('Erro ao cadastrar. Verifique os dados.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="flex justify-center mb-6">
          <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="h-16" />
        </div>
        <h2 className="text-center text-gray-600 mb-6 text-lg">Crie sua conta</h2>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <AtSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button
            onClick={handleRegister}
            className="w-full bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Criar conta
          </button>
          <p className="text-sm text-center text-gray-600 mt-4">
            Já tem uma conta?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-yellow-500 hover:underline cursor-pointer"
            >
              Entrar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
