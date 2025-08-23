// src/pages/Signup.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/services/firebase";

const Signup: React.FC = () => {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Se o usuário clicou em "Entrar" sem preencher, volta pro login
    if (!name.trim() || !email.trim() || !pass.trim()) {
      nav("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      nav("/", { replace: true });
    } catch (err: any) {
      alert(err?.message || "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded-xl border px-3 py-3" placeholder="Seu nome"
               value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full rounded-xl border px-3 py-3" placeholder="E-mail" type="email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-xl border px-3 py-3" placeholder="Senha" type="password"
               value={pass} onChange={e=>setPass(e.target.value)} />
        <button disabled={loading} className="w-full rounded-2xl bg-yellow-500 py-3 font-semibold text-black">
          {loading ? "Enviando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Já tem conta? <Link to="/login" className="text-yellow-700 underline">Entrar</Link>
      </p>

      <div className="mt-6 text-sm text-gray-500">
        Para entrar como visitante, use a opção <strong>“Entrar como visitante”</strong> na tela de Login.
      </div>
    </div>
  );
};

export default Signup;
