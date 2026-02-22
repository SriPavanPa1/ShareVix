import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    const storedRoles = localStorage.getItem('userRoles')
    const authToken = localStorage.getItem('authToken')

    if (storedUser && authToken) {
      try {
        const userData = JSON.parse(storedUser)
        const rolesData = storedRoles ? JSON.parse(storedRoles) : []
        setUser(userData)
        setRoles(rolesData)
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
        localStorage.removeItem('userRoles')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { user: userData, roles: userRoles, token } = response.data

      setUser(userData)
      setRoles(userRoles || [])
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('authToken', token)
      localStorage.setItem('userRoles', JSON.stringify(userRoles || []))

      return { success: true, user: userData, roles: userRoles }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (data) => {
    try {
      const response = await authAPI.register(data)
      const { user: userData, roles: userRoles, token } = response.data

      setUser(userData)
      setRoles(userRoles || [])
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('authToken', token)
      localStorage.setItem('userRoles', JSON.stringify(userRoles || []))

      return { success: true, user: userData }
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = () => {
    setUser(null)
    setRoles([])
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRoles')
  }

  const isAdmin = () => {
    return roles.includes('admin')
  }

  const isStudent = () => {
    return roles.includes('student')
  }

  const isAuthenticated = () => {
    return !!user
  }

  const hasRole = (role) => {
    return roles.includes(role)
  }

  const value = {
    user,
    roles,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isStudent,
    isAuthenticated,
    hasRole
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
