import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Lists from './pages/Lists'
import ListDetail from './pages/ListDetail'
import Scanner from './pages/Scanner'
import Compare from './pages/Compare'
import Prices from './pages/Prices'
import Profile from './pages/Profile'
import Terms from './pages/Terms'

import { Toaster } from './components/ui/Toaster'
import { DataProvider } from './context/DataContext'

const App: React.FC = () => {
  const user = sessionStorage.getItem('user')

  return (
    <DataProvider>
      <Toaster />
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {user ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/lists/:id" element={<ListDetail />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/prices" element={<Prices />} />           {/* ← rota Preços */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </DataProvider>
  )
}

export default App
