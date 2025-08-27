import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import ComprehensiveFormsSystem from './pages/forms/ComprehensiveFormsSystem'
import { AuthProvider } from './contexts/AuthContext'

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('cea_auth_token')
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/forms" element={<PrivateRoute><ComprehensiveFormsSystem /></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App