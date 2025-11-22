'use client'

import { useEffect, useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimeChannel } from 'ably'
import { useAblyClient } from './ably-provider'
import { getChannels } from './config'
import { AuthContext } from '@/contexts/AuthContext'

/**
 * Hook that subscribes to all configured Ably channels
 * and invalidates React Query cache when messages are received.
 */
export function useRealtimeSubscriptions() {
  const { client, isConnected } = useAblyClient()
  // Safely get auth context without throwing if not available
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!client || !isConnected) {
      console.log('🔍 Ably - Not ready:', { client: !!client, isConnected })
      return
    }

    const userId = user?.user_id
    console.log('🔍 Ably - User ID:', userId)

    const channels = getChannels(userId)
    console.log(
      '🔍 Ably - Subscribing to channels:',
      channels.map((c) => ({
        channel: c.channel,
        events: Object.keys(c.events)
      }))
    )

    const subscriptions: Array<{ channel: RealtimeChannel; events: string[] }> =
      []

    // Subscribe to all configured channels
    for (const config of channels) {
      const channel = client.channels.get(config.channel)

      for (const [eventName, eventConfig] of Object.entries(config.events)) {
        channel.subscribe(eventName, (message) => {
          console.log('📨 Ably - Message received:', {
            channel: config.channel,
            event: eventName,
            data: message.data,
            timestamp: new Date().toISOString()
          })

          // Invalidate all query keys for this event
          for (const queryKey of eventConfig.invalidate) {
            console.log('🔄 Ably - Invalidating query:', queryKey)
            queryClient.invalidateQueries({ queryKey })
          }
        })
      }

      subscriptions.push({
        channel,
        events: Object.keys(config.events)
      })
    }

    console.log('✅ Ably - Subscriptions active')

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
