import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../services/firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem("user", JSON.stringify(result.user));
      alert("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      alert("Erro ao entrar. Verifique seus dados.");
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      sessionStorage.setItem("user", JSON.stringify(result.user));
      alert("Login com Google realizado!");
      navigate("/dashboard");
    } catch (error) {
      alert("Erro no login com Google. Verifique o domínio autorizado.");
    }
  };

  const loginAsGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      sessionStorage.setItem("user", JSON.stringify(result.user));
      alert("Entrou como visitante!");
      navigate("/dashboard");
    } catch (error) {
      alert("Erro ao entrar como visitante.");
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
        onClick={login}
        className="w-full max-w-md bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow mb-4"
      >
        Entrar
      </button>

      <div className="flex items-center w-full max-w-md mb-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-4 text-gray-400">ou</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        onClick={loginWithGoogle}
        className="w-full max-w-md bg-white border border-gray-300 py-3 rounded-xl shadow flex items-center justify-center gap-2 mb-4"
      >
        <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
        Entrar com Google
      </button>

      <button
        onClick={loginAsGuest}
        className="w-full max-w-md bg-gray-200 text-black font-semibold py-3 rounded-xl shadow mb-4"
      >
        Continuar como visitante
      </button>

      <p className="text-sm">
        Não tem uma conta?{" "}
        <a href="/register" className="text-yellow-600 underline hover:text-yellow-700">
          Cadastre-se
        </a>
      </p>
    </div>
  );
}
