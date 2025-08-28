import { ReactElement, ReactNode, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { seedCatalogIfEmpty, fetchCatalog, suggestForName } from "@/services/catalog";

// Páginas
import ProductDetail from "./pages/ProductDetail";
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
import PurchaseEdit from "./pages/PurchaseEdit";
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

/** Roda somente em DEV para semear e testar o catálogo. */
function DevCatalogSeed() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    (async () => {
      const created = await seedCatalogIfEmpty();
      if (created) console.log("Catalog seeded:", created);

      const cat = await fetchCatalog();
      console.log("Catalog size:", cat.length);

      const s = suggestForName("coca cola 2l", cat);
      console.log("Suggestion:", s);
    })();
  }, []);
  return null;
}

/* ---------- bootstrap de auth --------- */
const AuthBootstrap = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // ✅ Se o Firebase restaurou uma sessão (uid existe), mantemos a sessão no sessionStorage
      if (user?.uid) {
        sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
        sessionStorage.setItem("userId", user.uid);
        if (!sessionStorage.getItem("authType")) {
          // marca que a sessão foi restaurada (não forçamos signOut)
          sessionStorage.setItem("authType", "restored");
        }
      } else {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("authType");
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return null; // pode trocar por um Splash
  return <>{children}</>;
};

/* -------------- guards --------------- */
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const uid = getStoredUserId();
  if (!uid) return <Navigate to="/login" replace />;
  return children;
};

const RequireOnboardingLayout = () => {
  const seen = typeof window !== "undefined" && localStorage.getItem("onboardingSeen") === "1";
  const loc = useLocation();
  if (!seen) return <Navigate to="/onboarding" replace state={{ from: loc }} />;
  return <Outlet />;
};

const PublicOnlyRoute = ({ children }: { children: ReactElement }) => {
  const uid = getStoredUserId();
  if (uid) return <Navigate to="/" replace />;
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const RootIndex = () => {
  const uid = getStoredUserId();
  return uid ? <Dashboard /> : <Navigate to="/login" replace />;
};

/* -------------- App --------------- */
export default function App() {
  return (
    <AuthBootstrap>
      {import.meta.env.DEV && <DevCatalogSeed />}
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
          <Route path="/purchases/:id/edit" element={<ProtectedRoute><PurchaseEdit /></ProtectedRoute>} />
          <Route path="/product/:name" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<RootIndex />} />
        </Route>
      </Routes>
    </AuthBootstrap>
  );
}
