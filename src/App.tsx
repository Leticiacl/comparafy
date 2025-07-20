// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Scanner from './pages/Scanner';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Compare from './pages/Compare';
import Onboarding from './pages/Onboarding';
import { DataProvider } from './context/DataContext';
import { Toaster } from './components/ui/Toaster'; // ✅ CORRIGIDO

function App() {
  const hasUser = sessionStorage.getItem('userId');

  return (
    <BrowserRouter>
      <DataProvider>
        {/* ✅ Toaster montado fora das rotas */}
        <Toaster />

        <Routes>
          {!hasUser ? (
            <>
              <Route path="/" element={<Onboarding onComplete={() => {}} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/list/:id" element={<ListDetail />} />
              <Route path="/compare" element={<Compare />} />
            </>
          )}
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
