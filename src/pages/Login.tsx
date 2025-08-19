// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { auth, provider } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const goHome = () => navigate("/"); // Dashboard está em "/"

  const handleLogin = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, senha);
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("authType", "email");
      toast.success("Login realizado com sucesso!");
      localStorage.setItem("onboardingSeen","1");
      goHome();
    } catch {
      toast.error("Erro ao fazer login.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { user } = await signInWithPopup(auth, provider);
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("authType", "google");
      toast.success("Login com Google realizado!");
      localStorage.setItem("onboardingSeen","1");
      goHome();
    } catch {
      toast.error("Erro ao fazer login com Google.");
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      const { user } = await signInAnonymously(auth);
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("authType", "anonymous");
      toast.success("Login como visitante realizado!");
      localStorage.setItem("onboardingSeen","1");
      goHome();
    } catch {
      toast.error("Erro ao entrar como visitante.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo e título */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/LOGO_REDUZIDA.png"
            alt="Comparafy"
            className="w-12 h-12 mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-800">COMPARAFY</h1>
          <p className="text-gray-500 text-sm">Entre com sua conta</p>
        </div>

        {/* Formulário */}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:border-yellow-400"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:border-yellow-400"
        />

        {/* Botão Entrar */}
        <button
          onClick={handleLogin}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg mb-4 transition duration-200"
        >
          Entrar
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border text-gray-800 font-medium py-3 rounded-lg mb-3 hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
          Continuar com Google
        </button>

        {/* Visitante */}
        <button
          onClick={handleAnonymousLogin}
          className="w-full bg-gray-100 hover:bg-gray-200 text-black font-medium py-3 rounded-lg"
        >
          Continuar como visitante
        </button>

        {/* Link para cadastro */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <a href="/register" className="text-yellow-600 font-semibold hover:underline">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
