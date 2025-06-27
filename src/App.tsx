// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { Toaster } from './components/ui/Toaster';
// Pages
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Compare from './pages/Compare';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import Layout from './components/Layout';
// Importando o componente Savings
import Savings from './components/Savings';

export function App() {
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('onboardingCompleted') === 'true';
  });

  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setOnboardingCompleted(true);
  };

  return (
    <ThemeProvider>
      <DataProvider>  {/* DataProvider garante que todos os dados estejam disponíveis */}
        <div className="w-full min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Router>
            <Routes>
              <Route path="/onboarding" element={onboardingCompleted ? <Navigate to="/dashboard" /> : <Onboarding onComplete={completeOnboarding} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="lists" element={<Lists />} />
                <Route path="lists/:id" element={<ListDetail />} />
                <Route path="compare" element={<Compare />} />
                <Route path="scanner" element={<Scanner />} />
                <Route path="profile" element={<Profile />} />
                {/* Rota para exibir as economias */}
                <Route path="savings" element={<Savings />} />
                <Route path="/" element={<Navigate to={onboardingCompleted ? '/dashboard' : '/onboarding'} />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </div>
      </DataProvider>
    </ThemeProvider>
  );
}