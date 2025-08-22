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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const goHome = () => navigate("/");

  const handleLogin = async () => {
    if (!email || !senha) return;
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, senha);
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("authType", "email");
      toast.success("Login realizado com sucesso!");
      goHome();
    } catch {
      toast.error("Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, provider);
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("authType", "google");
      toast.success("Login com Google realizado!");
      goHome();
    } catch {
      toast.error("Erro ao fazer login com Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const { user } = await signInAnonymously(auth);
      sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("authType", "anonymous");
      toast.success("Entrou como visitante!");
      goHome();
    } catch {
      toast.error("Erro ao entrar como visitante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/LOGO_REDUZIDA.png"
            alt="Comparafy"
            className="h-14 w-14 select-none"
            draggable={false}
          />
          <h1 className="mt-4 text-[28px] font-semibold tracking-tight text-slate-900">
            COMPARAFY
          </h1>
          <p className="mt-1 text-slate-500">Entre com sua conta</p>
        </div>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-3 border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400"
          autoComplete="email"
          inputMode="email"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 px-4 py-3 border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400"
          autoComplete="current-password"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-2xl bg-yellow-500 py-3 font-semibold text-black active:scale-[0.99] disabled:opacity-60"
        >
          Entrar
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-slate-300" />
          <span className="mx-2 text-slate-400 text-sm">ou</span>
          <hr className="flex-grow border-slate-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-slate-300 text-slate-800 font-medium py-3 rounded-2xl mb-3 hover:bg-slate-50 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
          Continuar com Google
        </button>

        <button
          onClick={handleAnonymousLogin}
          disabled={loading}
          className="w-full bg-slate-100 hover:bg-slate-200 text-black font-medium py-3 rounded-2xl disabled:opacity-60"
        >
          Continuar como visitante
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          Não tem uma conta?{" "}
          <a
            href="/register"
            className="text-yellow-700 font-semibold hover:underline"
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
