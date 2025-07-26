import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      toast.success('Conta criada com sucesso!');
      navigate('/login');
    } catch (err) {
      toast.error('Erro ao criar conta. Verifique os dados.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Criar Conta</h1>
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
        onClick={handleRegister}
        className="w-full max-w-md bg-yellow-500 text-black font-semibold py-3 rounded"
      >
        Criar Conta
      </button>
    </div>
  );
}
