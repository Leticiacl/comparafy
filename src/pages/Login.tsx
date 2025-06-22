import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSignIcon, LockIcon, UserIcon } from 'lucide-react';
import { showToast } from '../components/ui/Toaster';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Login realizado com sucesso', 'success');
    navigate('/dashboard');
  };

  const handleGuestLogin = () => {
    showToast('Entrando como visitante', 'success');
    navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Usuário logado:", user);
      showToast(`Bem-vindo, ${user.displayName}`, 'success'); // ← correção aqui
      navigate('/dashboard');
    } catch (error) {
      console.error("Erro ao logar com Google", error);
      showToast('Erro ao logar com Google', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white dark:bg-black">
      <div className="w-full max-w-sm">
        <img src="/COMPARAFY.png" alt="Logo" className="h-10 mx-auto mb-8" />
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          {isLogin ? 'Entre com sua conta' : 'Crie sua conta'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Nome completo"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                required
              />
            </div>
          )}
          <div className="relative">
            <AtSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              placeholder="E-mail"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              required
            />
          </div>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="password"
              placeholder="Senha"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              required
            />
          </div>
          <button type="submit" className="w-full bg-yellow-500 text-black font-medium py-3 rounded-lg">
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">ou</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium py-3 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
            Continuar com Google
          </button>
          <button
            onClick={handleGuestLogin}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium py-3 rounded-lg"
          >
            Continuar como visitante
          </button>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-yellow-500 font-medium">
            {isLogin ? 'Cadastre-se' : 'Entre'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;