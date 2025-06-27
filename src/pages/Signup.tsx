// src/pages/Signup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/ui/Toaster';  // Caso tenha um Toaster configurado

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      // Lógica de cadastro (usar Firebase ou qualquer outro método de cadastro)
      // Supondo que você tenha uma função para criar um usuário, como no Firebase.
      showToast('Cadastro realizado com sucesso!', 'success');
      navigate('/login'); // Redireciona para a página de login após o cadastro
    } catch (error) {
      showToast('Erro ao criar conta', 'error');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white dark:bg-black">
      <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-4">Cadastre-se</h2>
      
      <div className="w-full max-w-sm space-y-4">
        <div className="relative">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button
          onClick={handleSignup}
          className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-md"
        >
          Cadastre-se
        </button>
      </div>
    </div>
  );
};

export default Signup;
