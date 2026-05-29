import React, { createContext, useState, useContext, useEffect } from 'react'
import { assessmentAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false)

  const checkLatestAssessment = async () => {
    try {
      await assessmentAPI.getLatestAssessment()
      setHasCompletedAssessment(true)
    } catch (err) {
      if (err.response?.status === 404) {
        setHasCompletedAssessment(false)
      } else {
        setHasCompletedAssessment(false)
        throw err
      }
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        try {
          await checkLatestAssessment()
        } catch (err) {
          console.error('Failed to check assessment status', err)
        }
      }

      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (userData, authToken) => {
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setToken(authToken)
    setError(null)
    setLoading(true)

    try {
      await checkLatestAssessment()
    } finally {
      setLoading(false)
    }
  }

  const markAssessmentComplete = () => {
    setHasCompletedAssessment(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    setHasCompletedAssessment(false)
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    markAssessmentComplete,
    hasCompletedAssessment,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
