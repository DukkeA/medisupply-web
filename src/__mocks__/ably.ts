/**
 * Mock implementation of Ably SDK for testing
 *
 * This mock provides a complete Ably Realtime client implementation
 * that can be used in unit and integration tests without connecting
 * to actual Ably infrastructure.
 */

import { vi } from 'vitest'

export type ConnectionState =
  | 'initialized'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'suspended'
  | 'closing'
  | 'closed'
  | 'failed'

export type ChannelState =
  | 'initialized'
  | 'attaching'
  | 'attached'
  | 'detaching'
  | 'detached'
  | 'suspended'
  | 'failed'

export interface TokenRequest {
  token?: string
  keyName?: string
  clientId?: string
  mac?: string
  nonce?: string
  timestamp?: number
}

export interface Message {
  name?: string
  data?: unknown
  encoding?: string
  [key: string]: unknown
}

export interface ChannelStateChange {
  current: ChannelState
  previous: ChannelState
  reason?: Error
}

export interface ConnectionStateChange {
  current: ConnectionState
  previous: ConnectionState
  reason?: Error
  retryIn?: number
}

/**
 * Mock RealtimeChannel implementation
 */
export class RealtimeChannel {
  name: string
  state: string
  private listeners: Map<string, Array<(message: Message) => void>> = new Map()
  private allListeners: Array<(message: Message) => void> = []

  constructor(name: string) {
    this.name = name
    this.state = 'attached'
  }

  subscribe(eventName?: string, callback?: (message: Message) => void): void {
    if (!callback) return

    if (eventName) {
      if (!this.listeners.has(eventName)) {
        this.listeners.set(eventName, [])
      }
      this.listeners.get(eventName)!.push(callback)
    } else {
      this.allListeners.push(callback)
    }
  }

  unsubscribe(eventName?: string, callback?: (message: Message) => void): void {
    if (!eventName) {
      if (!callback) {
        this.listeners.clear()
        this.allListeners = []
      } else {
        const index = this.allListeners.indexOf(callback)
        if (index > -1) {
          this.allListeners.splice(index, 1)
        }
      }
    } else {
      if (!callback) {
        this.listeners.delete(eventName)
      } else {
        const callbacks = this.listeners.get(eventName)
        if (callbacks) {
          const index = callbacks.indexOf(callback)
          if (index > -1) {
            callbacks.splice(index, 1)
          }
        }
      }
    }
  }

  publish(eventName: string, data?: unknown): Promise<void> {
    const message: Message = { name: eventName, data }
    // Call event-specific listeners
    const callbacks = this.listeners.get(eventName)
    if (callbacks) {
      callbacks.forEach((cb) => cb(message))
    }
    // Call all-event listeners
    this.allListeners.forEach((cb) => cb(message))
    return Promise.resolve()
  }

  on(callback: (stateChange: ChannelStateChange) => void): void {
    // Mock implementation - call with connected state by default
    callback({
      current: 'attached',
      previous: 'attaching'
    })
  }

  once(
    eventName: string,
    callback: (stateChange: ChannelStateChange) => void
  ): void {
    callback({
      current: 'attached',
      previous: 'attaching'
    })
  }

  presence = {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    enter: vi.fn(),
    update: vi.fn(),
    leave: vi.fn(),
    get: vi.fn(),
    history: vi.fn()
  }
}

/**
 * Mock Channels implementation
 */
export class Channels {
  private channels: Map<string, RealtimeChannel> = new Map()

  get(name: string): RealtimeChannel {
    if (!this.channels.has(name)) {
      this.channels.set(name, new RealtimeChannel(name))
    }
    return this.channels.get(name)!
  }

  release(name: string): Promise<void> {
    this.channels.delete(name)
    return Promise.resolve()
  }

  exists(name: string): boolean {
    return this.channels.has(name)
  }
}

/**
 * Mock Connection implementation
 */
export class Connection {
  state: ConnectionState = 'connected'
  private listeners: Map<
    string,
    Array<(stateChange: ConnectionStateChange) => void>
  > = new Map()
  private allListeners: Array<(stateChange: ConnectionStateChange) => void> = []

  on(
    eventNameOrCallback?:
      | string
      | ((stateChange: ConnectionStateChange) => void),
    callback?: (stateChange: ConnectionStateChange) => void
  ): void {
    if (typeof eventNameOrCallback === 'function') {
      // Called with just a callback (subscribe to all events)
      const cb = eventNameOrCallback
      this.allListeners.push(cb)
      // Immediately call with current state
      cb({
        current: this.state,
        previous: 'initialized'
      })
    } else if (eventNameOrCallback && callback) {
      // Called with event name and callback
      if (!this.listeners.has(eventNameOrCallback)) {
        this.listeners.set(eventNameOrCallback, [])
      }
      this.listeners.get(eventNameOrCallback)!.push(callback)
      // Immediately call with current state if it matches
      if (eventNameOrCallback === this.state) {
        callback({
          current: this.state,
          previous: 'initialized'
        })
      }
    }
  }

  once(
    eventName: string,
    callback: (stateChange: ConnectionStateChange) => void
  ): void {
    const wrappedCallback = (stateChange: ConnectionStateChange) => {
      callback(stateChange)
      this.off(eventName, wrappedCallback)
    }
    this.on(eventName, wrappedCallback)
  }

  off(
    eventNameOrCallback?:
      | string
      | ((stateChange: ConnectionStateChange) => void),
    callback?: (stateChange: ConnectionStateChange) => void
  ): void {
    if (typeof eventNameOrCallback === 'function') {
      const cb = eventNameOrCallback
      const index = this.allListeners.indexOf(cb)
      if (index > -1) {
        this.allListeners.splice(index, 1)
      }
    } else if (eventNameOrCallback && callback) {
      const callbacks = this.listeners.get(eventNameOrCallback)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  close(): void {
    this.state = 'closed'
  }
}

/**
 * Mock Realtime client implementation
 */
export class Realtime {
  channels: Channels
  connection: Connection
  private authCallback?: (
    tokenParams: unknown,
    callback: (error: unknown, tokenRequest: TokenRequest | null) => void
  ) => void
  private closed: boolean = false

  constructor(options?: {
    authCallback?: (
      tokenParams: unknown,
      callback: (error: unknown, tokenRequest: TokenRequest | null) => void
    ) => void
    disconnectedRetryTimeout?: number
    suspendedRetryTimeout?: number
    key?: string
    token?: string
    [key: string]: unknown
  }) {
    this.channels = new Channels()
    this.connection = new Connection()
    this.authCallback = options?.authCallback

    // Simulate connection establishment
    if (this.authCallback) {
      // Call auth callback to test it's being invoked
      this.authCallback(
        {},
        (error: unknown, tokenRequest: TokenRequest | null) => {
          if (!error && tokenRequest) {
            // Token received, connection can proceed
          }
        }
      )
    }
  }

  close(): void {
    this.closed = true
    this.connection.close()
  }

  connect(): void {
    if (!this.closed) {
      this.connection.state = 'connecting'
      // Simulate connection establishment
      setTimeout(() => {
        if (!this.closed) {
          this.connection.state = 'connected'
        }
      }, 0)
    }
  }

  auth = {
    authorize: vi.fn(),
    revokeTokens: vi.fn()
  }

  push = {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn()
  }

  request = vi.fn()
}

/**
 * Export types for use in applications
 */
export type {
  TokenRequest as ITokenRequest,
  Message as IMessage,
  ChannelStateChange as IChannelStateChange,
  ConnectionStateChange as IConnectionStateChange
}
