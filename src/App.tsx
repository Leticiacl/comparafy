import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

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
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";

// Pré-login
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Register from "./pages/Register";

/* -------- helpers -------- */
/** Só considera o usuário logado se TAMBÉM existir authType.
    Isso evita “sessões fantasmas” e garante exibir Onboarding/Login
    quando não estiver realmente autenticado. */
function getStoredUserId(): string | null {
  const id = sessionStorage.getItem("userId");
  const authType = sessionStorage.getItem("authType"); // 'email' | 'google' | 'anonymous'
  if (!id || !authType) return null;
  return id;
}

/* -------- guards -------- */
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const uid = getStoredUserId();
  if (!uid) return <Navigate to="/onboarding" replace />;
  return children;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const uid = getStoredUserId();
  if (uid) return <Navigate to="/" replace />;
  return children;
};

// convenience: rolar pro topo na navegação
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

const App: React.FC = () => {
  const uid = getStoredUserId();

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* PRÉ-LOGIN */}
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

        {/* PROTEGIDAS */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
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
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to={uid ? "/" : "/onboarding"} replace />} />
      </Routes>
    </>
  );
};

export default App;
