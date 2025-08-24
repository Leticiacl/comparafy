import { ReactElement, ReactNode, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, Outlet } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";

// Páginas
import Dashboard from "./pages/Dashboard";
import Lists from "./pages/Lists";
import ListDetail from "./pages/ListDetail";
import Compare from "./pages/Compare";
import Prices from "./pages/Prices";
import Purchases from "./pages/Purchases";
import PurchaseNew from "./pages/PurchaseNew";
import PurchaseFromList from "./pages/PurchaseFromList";
import PurchasesReceipt from "./pages/PurchasesReceipt";
import PurchaseDetail from "./pages/PurchaseDetail";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";

// Pré-login
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Register from "./pages/Register";

/* ------------ helpers ------------- */
function cleanBadSession() {
  const bad = new Set(["", "undefined", "null"]);
  const v1 = sessionStorage.getItem("userId");
  if (v1 && bad.has(v1)) sessionStorage.removeItem("userId");
  const v2 = sessionStorage.getItem("user");
  if (v2 && bad.has(v2)) sessionStorage.removeItem("user");
}
function looksLikeUid(s: string | null) { return !!s && /^[A-Za-z0-9_-]{10,}$/.test(s); }
function getStoredUserId(): string | null {
  cleanBadSession();
  const direct = sessionStorage.getItem("userId");
  if (looksLikeUid(direct)) return direct!;
  const raw = sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    const uid = obj?.uid || obj?.id || obj?.userId || null;
    return looksLikeUid(uid) ? uid : null;
  } catch { return looksLikeUid(raw) ? raw : null; }
}

/* ---------- bootstrap de auth --------- */
const AuthBootstrap = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const authType = sessionStorage.getItem("authType"); // "email" | "google" | "anonymous"

      // ✅ Só consideramos logado nesta SESSÃO se o Login tiver marcado o authType
      if (user?.uid && authType) {
        sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
        sessionStorage.setItem("userId", user.uid);
      } else {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userId");

        // Bloqueia qualquer usuário que chegou “de carona” (persistência),
        // inclusive anônimo não iniciado pelo botão "Visitante".
        if (user && !authType) {
          try { await signOut(auth); } catch {}
        }
      }

      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return null; // pode trocar por um Splash/Spinner
  return <>{children}</>;
};

/* -------------- guards --------------- */
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const uid = getStoredUserId();
  if (!uid) return <Navigate to="/login" replace />;
  return children;
};

/** Layout que exige ter visto o onboarding */
const RequireOnboardingLayout = () => {
  const seen = typeof window !== "undefined" && localStorage.getItem("onboardingSeen") === "1";
  const loc = useLocation();
  if (!seen) return <Navigate to="/onboarding" replace state={{ from: loc }} />;
  return <Outlet />;
};

/** Páginas públicas que só aparecem se NÃO logado (nesta sessão) */
const PublicOnlyRoute = ({ children }: { children: ReactElement }) => {
  const uid = getStoredUserId();
  if (uid) return <Navigate to="/" replace />;
  return children;
};

/* Util */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

/* Index: decide entre dashboard e login (onboarding já garantido pelo layout) */
const RootIndex = () => {
  const uid = getStoredUserId();
  return uid ? <Dashboard /> : <Navigate to="/login" replace />;
};

/* -------------- App --------------- */
export default function App() {
  return (
    <AuthBootstrap>
      <ScrollToTop />
      <Routes>
        {/* Sempre acessível */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/terms" element={<Terms />} />

        {/* Demais rotas só após ver o onboarding */}
        <Route element={<RequireOnboardingLayout />}>
          {/* Pré-login */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Index decide */}
          <Route path="/" element={<RootIndex />} />

          {/* Protegidas */}
          <Route path="/lists" element={<ProtectedRoute><Lists /></ProtectedRoute>} />
          <Route path="/lists/:id" element={<ProtectedRoute><ListDetail /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Prices /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/purchases/new" element={<ProtectedRoute><PurchaseNew /></ProtectedRoute>} />
          <Route path="/purchases/from-list" element={<ProtectedRoute><PurchaseFromList /></ProtectedRoute>} />
          <Route path="/purchases/receipt" element={<ProtectedRoute><PurchasesReceipt /></ProtectedRoute>} />
          <Route path="/purchases/:id" element={<ProtectedRoute><PurchaseDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<RootIndex />} />
        </Route>
      </Routes>
    </AuthBootstrap>
  );
}
