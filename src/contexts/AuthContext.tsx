'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  loginAuthLoginPost,
  refreshAuthRefreshPost,
  getMeAuthMeGet
} from '@/generated'
import type {
  UserMeResponse,
  LoginResponse,
  RefreshTokenResponse
} from '@/generated'

interface AuthContextType {
  user: UserMeResponse | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
  const [user, setUser] = useState<UserMeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      // Skip initialization if localStorage is not available (e.g., in test environment)
      if (
        typeof window === 'undefined' ||
        typeof localStorage === 'undefined'
      ) {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')

      if (accessToken) {
        // Set cookie for middleware
        document.cookie = `auth-token=${accessToken}; path=/`
        try {
          // Try to get user info
          const userData = await getMeAuthMeGet()
          if (isMounted) {
            setUser(userData)
          }
        } catch {
          // If failed, try refresh
          if (refreshToken) {
            try {
              const newTokens: RefreshTokenResponse =
                await refreshAuthRefreshPost({ refresh_token: refreshToken })
              localStorage.setItem('access_token', newTokens.access_token)
              localStorage.setItem('id_token', newTokens.id_token)
              // Keep existing refresh_token as RefreshTokenResponse doesn't return a new one
              // Set cookie for middleware
              document.cookie = `auth-token=${newTokens.access_token}; path=/`

              // Get user info
              const userData = await getMeAuthMeGet()
              if (isMounted) {
                setUser(userData)
              }
            } catch {
              // Logout if refresh fails
              if (isMounted) {
                logoutInternal()
              }
            }
          } else {
            if (isMounted) {
              logoutInternal()
            }
          }
        }
      }
      if (isMounted) {
        setIsLoading(false)
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Skip navigation if localStorage is not available (e.g., in test environment)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (!isLoading && !user && pathname !== '/login') {
        router.push('/login')
      }
    }
  }, [isLoading, user, pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const tokens: LoginResponse = await loginAuthLoginPost({
        email,
        password
      })

      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('id_token', tokens.id_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      // Set cookie for middleware
      document.cookie = `auth-token=${tokens.access_token}; path=/`

      // Get user info
      const userData = await getMeAuthMeGet()
      setUser(userData)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logoutInternal = () => {
    // Internal logout that only clears state, used during initialization
    // Only modify localStorage if it's available
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('id_token')
      localStorage.removeItem('refresh_token')
      document.cookie =
        'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    setUser(null)
  }

  const logout = () => {
    logoutInternal()
    // Navigate to login if not already there
    if (typeof window !== 'undefined' && pathname !== '/login') {
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
