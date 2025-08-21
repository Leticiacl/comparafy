import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { auth } from "../services/firebase";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const mapError = (code?: string) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "E-mail já cadastrado.";
      case "auth/invalid-email":
        return "E-mail inválido.";
      case "auth/weak-password":
        return "Senha muito fraca (mín. 6 caracteres).";
      case "auth/operation-not-allowed":
        return "Cadastro por e-mail/senha está desabilitado no Firebase.";
      default:
        return "Não foi possível criar sua conta agora.";
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);

    if (!email.includes("@")) {
      setErrMsg("Informe um e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      setErrMsg("Senha muito fraca (mín. 6 caracteres).");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      toast.success("Conta criada! Faça login para continuar.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      const msg = mapError(err?.code);
      setErrMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <img src="/COMPARAFY.png" alt="Comparafy" className="w-40 mb-8" />

      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:border-yellow-400"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:border-yellow-400"
          required
          minLength={6}
        />

        {errMsg && (
          <p className="text-sm text-red-600" role="alert">
            {errMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-black font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <p className="text-center text-sm text-gray-600 pt-2">
          Já tem conta?{" "}
          <Link to="/login" className="text-yellow-700 font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
