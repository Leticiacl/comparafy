import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Login from './pages/Login';
import { Toaster } from './components/ui/Toaster';

const App: React.FC = () => {
  const userId = sessionStorage.getItem('userId');

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
