import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider, ensureAnonymousSession } from "@/services/firebase";

const Login: React.FC = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goHome = () => nav("/", { replace: true });

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      goHome();
    } catch (err: any) {
      setError(err?.message || "Não foi possível entrar. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      goHome();
    } catch (err: any) {
      setError(err?.message || "Falha ao entrar com Google.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setError(null);
    setLoading(true);
    try {
      await ensureAnonymousSession();
      goHome();
    } catch (err: any) {
      setError(err?.message || "Falha ao entrar como visitante.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-screen">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/COMPARAFY.png" alt="Comparafy" className="mx-auto h-8 w-auto" />
        </div>

        <h1 className="mb-4 text-2xl font-extrabold">Entrar</h1>

        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-yellow-500 py-3 font-semibold text-black hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 grid gap-2">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-2xl border border-gray-300 bg-white py-3 font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            Entrar com Google
          </button>
          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full rounded-2xl bg-gray-900 py-3 font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            Entrar como visitante
          </button>
          <Link
            to="/register"
            className="mt-1 block w-full rounded-2xl bg-gray-100 py-3 text-center font-medium text-gray-900 hover:bg-gray-200"
          >
            Criar conta
          </Link>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <p className="mt-6 text-center text-xs text-gray-500">
          Ao continuar, você concorda com nossos <Link to="/terms" className="underline">Termos de uso</Link>.
        </p>
      </div>
    </div>
  );
};

export default Login;
