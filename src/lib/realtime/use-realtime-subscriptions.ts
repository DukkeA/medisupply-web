'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimeChannel } from 'ably'
import { useAblyClient } from './ably-provider'
import { getChannels } from './config'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook that subscribes to all configured Ably channels
 * and invalidates React Query cache when messages are received.
 */
export function useRealtimeSubscriptions() {
  const { client, isConnected } = useAblyClient()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!client || !isConnected) {
      return
    }

    const userId = user?.user_id
    const channels = getChannels(userId)
    const subscriptions: Array<{ channel: RealtimeChannel; events: string[] }> =
      []

    // Subscribe to all configured channels
    for (const config of channels) {
      const channel = client.channels.get(config.channel)

      for (const [eventName, eventConfig] of Object.entries(config.events)) {
        channel.subscribe(eventName, () => {
          // Invalidate all query keys for this event
          for (const queryKey of eventConfig.invalidate) {
            queryClient.invalidateQueries({ queryKey })
          }
        })
      }

      subscriptions.push({
        channel,
        events: Object.keys(config.events)
      })
    }

    // Cleanup subscriptions on unmount
    return () => {
      for (const { channel, events } of subscriptions) {
        for (const eventName of events) {
          channel.unsubscribe(eventName)
        }
      }
    }
  }, [client, isConnected, queryClient, user?.user_id])
}
