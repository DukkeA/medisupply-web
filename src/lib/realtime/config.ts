import type { QueryKey } from '@tanstack/react-query'

export type ChannelEventConfig = {
  /** Query keys to invalidate when this event is received */
  invalidate: QueryKey[]
}

export type ChannelConfig = {
  /** Ably channel name (can be dynamic with {userId} placeholder) */
  channel: string
  /** Map of event names to their handlers */
  events: Record<string, ChannelEventConfig>
  /** Whether this channel requires user ID substitution */
  requiresUserId?: boolean
}

/**
 * Central registry for all realtime subscriptions.
 *
 * Channels:
 * - web:{userId} - User-specific channel for personal notifications
 * - web:broadcasts - Global broadcast channel for all web users
 */
export const realtimeConfig: Record<string, ChannelConfig> = {
  userChannel: {
    channel: 'web:{userId}',
    requiresUserId: true,
    events: {
      'report.generated': { invalidate: [['listReportsBffWebReportsGet']] }
    }
  },
  broadcasts: {
    channel: 'web:broadcasts',
    events: {
      'routes.generated': { invalidate: [['routes']] }
    }
  }
}

/**
 * Get all configured channels with userId substituted
 */
export function getChannels(userId?: string): ChannelConfig[] {
  return Object.values(realtimeConfig)
    .filter((config) => {
      // Skip user-specific channels if no userId provided
      if (config.requiresUserId && !userId) {
        return false
      }
      return true
    })
    .map((config) => {
      // Substitute userId in channel name
      if (config.requiresUserId && userId) {
        return {
          ...config,
          channel: config.channel.replace('{userId}', userId)
        }
      }
      return config
    })
}
