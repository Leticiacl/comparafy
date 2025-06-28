import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, provider } from '../services/firebase';
import { showToast } from '../components/ui/Toaster';
import { AtSignIcon, LockIcon } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, senha);
      sessionStorage.setItem('userId', result.user.uid);
      showToast('Login realizado com sucesso', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Falha no login com e-mail', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      sessionStorage.setItem('userId', result.user.uid);
      showToast('Login com Google bem-sucedido', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro ao entrar com Google', 'error');
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      const result = await signInAnonymously(auth);
      sessionStorage.setItem('userId', result.user.uid);
      showToast('Login como visitante realizado', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Erro ao entrar como visitante', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="flex justify-center mb-6">
          <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="h-16" />
        </div>
        <h2 className="text-center text-gray-600 mb-6 text-lg">Entre com sua conta</h2>

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
            onClick={handleEmailLogin}
            className="w-full bg-yellow-500 text-white font-semibold py-3 rounded-lg hover:bg-yellow-600 transition"
          >
            Entrar
          </button>

          <div className="flex items-center justify-center text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4">ou</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 text-black font-medium py-3 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continuar com Google
          </button>

          <button
            onClick={handleAnonymousLogin}
            className="w-full bg-gray-100 text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Continuar como visitante
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Não tem uma conta?{' '}
            <span
              onClick={() => showToast('Função de cadastro em desenvolvimento', 'info')}
              className="text-yellow-500 hover:underline cursor-pointer"
            >
              Cadastre-se
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
