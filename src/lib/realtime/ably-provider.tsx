'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode
} from 'react'
import * as Ably from 'ably'
import { generateTokenAuthAblyTokenPost } from '@/generated/api/realtime/realtime'

type ConnectionState =
  | 'initialized'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'suspended'
  | 'closing'
  | 'closed'
  | 'failed'

interface AblyContextValue {
  client: Ably.Realtime | null
  connectionState: ConnectionState
  isConnected: boolean
}

const AblyContext = createContext<AblyContextValue | null>(null)

export function useAblyClient() {
  const context = useContext(AblyContext)
  if (!context) {
    throw new Error('useAblyClient must be used within AblyProvider')
  }
  return context
}

interface AblyProviderProps {
  children: ReactNode
}

export function AblyProvider({ children }: AblyProviderProps) {
  const [client, setClient] = useState<Ably.Realtime | null>(null)
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('initialized')
  const clientRef = useRef<Ably.Realtime | null>(null)

  useEffect(() => {
    // Check if localStorage is available and user is authenticated
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) {
      return
    }

    const ablyClient = new Ably.Realtime({
      authCallback: async (_tokenParams, callback) => {
        try {
          const response = await generateTokenAuthAblyTokenPost()
          callback(null, response.token_request as Ably.TokenRequest)
        } catch (error) {
          console.error('Failed to fetch Ably token:', error)
          callback(
            error instanceof Error ? error.message : 'Token fetch failed',
            null
          )
        }
      },
      disconnectedRetryTimeout: 15000,
      suspendedRetryTimeout: 30000
    })

    clientRef.current = ablyClient
    setClient(ablyClient)

    // Track connection state
    ablyClient.connection.on((stateChange) => {
      setConnectionState(stateChange.current as ConnectionState)

      if (stateChange.current === 'failed') {
        console.error('Ably connection failed:', stateChange.reason)
      }
    })

    return () => {
      ablyClient.close()
      clientRef.current = null
    }
  }, [])

  const value: AblyContextValue = {
    client,
    connectionState,
    isConnected: connectionState === 'connected'
  }

  return <AblyContext.Provider value={value}>{children}</AblyContext.Provider>
}
