import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('cea_auth_token')
    const profile = localStorage.getItem('cea_user_profile')
    
    if (token && profile) {
      try {
        setUser(JSON.parse(profile))
      } catch (e) {
        localStorage.removeItem('cea_auth_token')
        localStorage.removeItem('cea_user_profile')
      }
    }
    setLoading(false)
  }, [])

  const value = {
    user,
    loading,
    signOut: () => {
      localStorage.removeItem('cea_auth_token')
      localStorage.removeItem('cea_user_profile')
      setUser(null)
      window.location.href = '/login'
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}