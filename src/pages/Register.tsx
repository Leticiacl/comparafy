import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem("user", JSON.stringify(result.user));
      alert("Conta criada com sucesso!");
      navigate("/login");
    } catch (error) {
      alert("Erro ao criar conta. Verifique os dados.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4">
      <img src="/COMPARAFY.png" alt="Logo" className="w-40 mb-8" />

      <input
        type="email"
        placeholder="Email"
        className="w-full max-w-md border rounded p-3 mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        className="w-full max-w-md border rounded p-3 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={register}
        className="w-full max-w-md bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow mb-4"
      >
        Criar conta
      </button>

      <p className="text-sm">
        Já tem uma conta?{" "}
        <a href="/login" className="text-yellow-600 underline hover:text-yellow-700">
          Entrar
        </a>
      </p>
    </div>
  );
}
