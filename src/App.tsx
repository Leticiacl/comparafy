// src/App.tsx
import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
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

function looksLikeUid(s: string | null) {
  return !!s && /^[A-Za-z0-9_-]{10,}$/.test(s);
}

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
  } catch {
    return looksLikeUid(raw) ? raw : null;
  }
}

/* ---------- bootstrap de auth --------- */
const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.uid) {
        sessionStorage.setItem("user", JSON.stringify({ uid: user.uid }));
        sessionStorage.setItem("userId", user.uid);
      } else {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userId");
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return null; // splash opcional
  return <>{children}</>;
};

/* -------------- guards --------------- */
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const uid = getStoredUserId();
  if (!uid) return <Navigate to="/onboarding" replace />;
  return children;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const uid = getStoredUserId();
  const seen = typeof window !== "undefined" && localStorage.getItem("onboardingSeen") === "1";
  if (uid && seen) return <Navigate to="/" replace />;
  return children;
};

/* ----------- util ---------- */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

/* Se não estiver logada, "/" manda para /onboarding; senão mostra Dashboard */
const RootIndex: React.FC = () => {
  const uid = getStoredUserId();
  const seen = typeof window !== "undefined" && localStorage.getItem("onboardingSeen") === "1";
  if (!seen) return <Navigate to="/onboarding" replace />;
  return uid ? <Dashboard /> : <Navigate to="/login" replace />;
};

/* -------------- App --------------- */
const App: React.FC = () => {
  return (
    <AuthBootstrap>
      <ScrollToTop />
      <Routes>
        {/* pré-login */}
        <Route
          path="/onboarding"
          element={
            <PublicOnlyRoute>
              <Onboarding />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* público livre */}
        <Route path="/terms" element={<Terms />} />

        {/* index decide */}
        <Route path="/" element={<RootIndex />} />

        {/* protegidas */}
        <Route
          path="/lists"
          element={
            <ProtectedRoute>
              <Lists />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lists/:id"
          element={
            <ProtectedRoute>
              <ListDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Prices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <Purchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases/new"
          element={
            <ProtectedRoute>
              <PurchaseNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases/from-list"
          element={
            <ProtectedRoute>
              <PurchaseFromList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases/receipt"
          element={
            <ProtectedRoute>
              <PurchasesReceipt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases/:id"
          element={
            <ProtectedRoute>
              <PurchaseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<RootIndex />} />
      </Routes>
    </AuthBootstrap>
  );
};

export default App;
