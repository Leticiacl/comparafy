import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Login from './pages/Login';
import { Toaster } from './components/ui/Toaster';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(sessionStorage.getItem('userId'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        sessionStorage.setItem('userId', user.uid);
        setUserId(user.uid);
      } else {
        sessionStorage.removeItem('userId');
        setUserId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // ou um spinner, se quiser

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={userId ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/lists" element={userId ? <Lists /> : <Navigate to="/login" />} />
          <Route path="/lists/:id" element={userId ? <ListDetail /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={userId ? "/" : "/login"} />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
};

export default App;
