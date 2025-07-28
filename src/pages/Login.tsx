import React, { useState } from "react";
import { auth, provider } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, senha);
      const user = result.user;
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao fazer login.");
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      toast.success("Login com Google realizado!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao fazer login com Google.");
      console.error(error);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      toast.success("Login como visitante realizado!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Erro ao entrar como visitante.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-12 h-12 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">COMPARAFY</h1>
          <p className="text-gray-500 text-sm">Entre com sua conta</p>
        </div>

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

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg mb-4 transition duration-200"
        >
          Entrar
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border text-gray-800 font-medium py-3 rounded-lg mb-3 hover:bg-gray-50 transition"
        >
          Continuar com Google
        </button>

        <button
          onClick={handleAnonymousLogin}
          className="w-full bg-gray-100 hover:bg-gray-200 text-black font-medium py-3 rounded-lg"
        >
          Continuar como visitante
        </button>

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
