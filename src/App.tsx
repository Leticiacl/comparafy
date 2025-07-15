// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import Dashboard from './pages/Dashboard';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import { Toaster } from './components/ui/Toaster';

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUserId(user ? user.uid : null);
      sessionStorage.setItem('userId', user?.uid ?? '');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; // ou spinner

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={userId ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/lists" element={userId ? <Lists /> : <Navigate to="/login" replace />} />
        <Route path="/lists/:id" element={userId ? <ListDetail /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={userId ? '/' : '/login'} replace />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
