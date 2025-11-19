'use client'

import type { ReactNode } from 'react'
import { AblyProvider } from './ably-provider'
import { useRealtimeSubscriptions } from './use-realtime-subscriptions'

function RealtimeSubscriptionManager({ children }: { children: ReactNode }) {
  useRealtimeSubscriptions()
  return <>{children}</>
}

interface RealtimeProviderProps {
  children: ReactNode
}

/**
 * Main realtime provider that wraps the app.
 * Handles Ably connection and subscribes to all configured channels.
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  return (
    <AblyProvider>
      <RealtimeSubscriptionManager>{children}</RealtimeSubscriptionManager>
    </AblyProvider>
  )
}
