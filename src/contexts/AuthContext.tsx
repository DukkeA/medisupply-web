'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { apiClient } from '@/services/api-client'

interface User {
  user_id: string
  name: string | null
  email: string | null
  groups: string[]
  user_type: string | null
}

interface AuthTokens {
  access_token: string
  id_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')

      if (accessToken) {
        // Set cookie for middleware
        document.cookie = `auth-token=${accessToken}; path=/`
        try {
          // Try to get user info
          const idToken = localStorage.getItem('id_token')
          const response = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${idToken}` }
          })
          setUser(response.data)
        } catch {
          // If failed, try refresh
          if (refreshToken) {
            try {
              const refreshResponse = await apiClient.post('/auth/refresh', {
                refresh_token: refreshToken
              })
              const newTokens: AuthTokens = refreshResponse.data
              localStorage.setItem('access_token', newTokens.access_token)
              localStorage.setItem('id_token', newTokens.id_token)
              localStorage.setItem('refresh_token', newTokens.refresh_token)
              // Set cookie for middleware
              document.cookie = `auth-token=${newTokens.access_token}; path=/`

              // Get user info
              const userResponse = await apiClient.get('/auth/me', {
                headers: { Authorization: `Bearer ${newTokens.id_token}` }
              })
              setUser(userResponse.data)
            } catch {
              // Logout if refresh fails
              logout()
            }
          } else {
            logout()
          }
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [isLoading, user, pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const tokens: AuthTokens = response.data

      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('id_token', tokens.id_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      // Set cookie for middleware
      document.cookie = `auth-token=${tokens.access_token}; path=/`

      // Get user info
      const userResponse = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })
      setUser(userResponse.data)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('refresh_token')
    document.cookie =
      'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setUser(null)
    if (pathname !== '/login') {
      router.push('/login')
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
