import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Compare from './pages/Compare';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import { DataProvider } from './context/DataContext';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App iniciado');
    const storedUser = sessionStorage.getItem('user');
    console.log('Usuário armazenado:', storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '40vh' }}>Carregando...</div>;
  }

  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

  return (
    <DataProvider user={user}>
      <Router>
        <Routes>
          {!hasSeenOnboarding && <Route path="*" element={<Onboarding />} />}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/lists" element={user ? <Lists /> : <Navigate to="/login" />} />
          <Route path="/lists/:id" element={user ? <ListDetail /> : <Navigate to="/login" />} />
          <Route path="/compare" element={user ? <Compare /> : <Navigate to="/login" />} />
          <Route path="/scanner" element={user ? <Scanner /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
