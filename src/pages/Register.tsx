// src/pages/Register.tsx
import React, { useState } from "react";
import { auth } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      toast.success("Conta criada com sucesso");
      navigate("/login");
    } catch (error: any) {
      toast.error("Erro ao criar conta");
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
      <img src="/COMPARAFY.png" alt="Logo" className="w-40 mb-8" />
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border px-4 py-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full border px-4 py-3 rounded"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-400 py-3 rounded font-semibold"
        >
          Cadastrar
        </button>
        <p className="text-sm text-center mt-4">
          Já tem conta?{" "}
          <a href="/login" className="text-blue-500 underline">
            Entrar
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
