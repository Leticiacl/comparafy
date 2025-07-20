import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInAnonymously, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Email ou senha inválidos.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      toast.error(`Erro no login com Google: ${error}`);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao entrar como visitante.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      <img src="/COMPARAFY.png" alt="Logo" className="h-12 object-contain mb-8" />

      <h1 className="text-xl font-bold mb-6 text-gray-900">Entrar no Comparify</h1>

      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center border rounded-lg px-3 py-2">
          <Mail className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>

        <div className="flex items-center border rounded-lg px-3 py-2">
          <Lock className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow"
        >
          Entrar
        </button>

        <div className="flex items-center my-2">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-400">ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <FcGoogle className="w-5 h-5" />
          Entrar com Google
        </button>

        <button
          onClick={handleAnonymousLogin}
          className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl"
        >
          Continuar como visitante
        </button>

        <p className="text-sm text-center mt-4 text-blue-600">
          <a href="/register">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
