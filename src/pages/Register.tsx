import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/services/firebase";

const Register: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), senha.trim());
      await signOut(auth); // volta pro login após cadastro
      toast.success("Conta criada! Faça login para entrar.");
      nav("/login", { replace: true });
    } catch (err: any) {
      const msg =
        err?.code === "auth/email-already-in-use"
          ? "E-mail já cadastrado."
          : err?.code === "auth/weak-password"
          ? "Senha muito fraca (mín. 6 caracteres)."
          : "Não foi possível criar a conta.";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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
          <p className="mt-1 text-slate-500">Crie sua conta</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoComplete="email"
            inputMode="email"
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-yellow-500 py-3 font-semibold text-black active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="mt-6 text-center text-slate-600">
          Já tem conta?{" "}
          <Link
            to="/login"
            className="font-semibold text-yellow-700 hover:underline"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;