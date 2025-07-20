import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async () => {
    if (!email || !senha) {
      toast.error("Preencha todos os campos.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      toast.success("Conta criada com sucesso. Faça login.");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao criar conta. Verifique os dados.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      <img src="/COMPARAFY.png" alt="Logo" className="h-12 object-contain mb-8" />

      <h1 className="text-xl font-bold mb-6 text-gray-900">Criar conta</h1>

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
          onClick={handleRegister}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow"
        >
          Criar conta
        </button>

        <p className="text-sm text-center mt-4 text-blue-600">
          <a href="/login">Já tem conta? Faça login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
