import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/__tests__/test-utils'
import { useAblyClient } from './ably-provider'
import { useRealtimeSubscriptions } from './use-realtime-subscriptions'

/**
 * Test suite for Ably Realtime integration
 * Verifies that the mocked Ably SDK works correctly in tests
 */
describe('Ably Realtime Integration', () => {
  beforeEach(() => {
    // Mock localStorage.getItem to return a token for tests
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => {
        if (key === 'access_token') {
          return 'mock-token'
        }
        return null
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    })
  })

  it('should provide Ably client through context', () => {
    let clientValue: ReturnType<typeof useAblyClient> | undefined

    const TestComponent = () => {
      clientValue = useAblyClient()
      return <div>Test</div>
    }

    renderWithProviders(<TestComponent />)

    expect(clientValue).toBeDefined()
    expect(clientValue!.client).toBeDefined()
    expect(clientValue!.isConnected).toBe(true)
  })

  it('should initialize connection state', () => {
    let connectionState: string | null = null

    const TestComponent = () => {
      const { connectionState: state } = useAblyClient()
      connectionState = state
      return <div>{state}</div>
    }

    renderWithProviders(<TestComponent />)

    expect(connectionState).toBe('connected')
  })

  it('should subscribe to realtime channels', () => {
    let subscriptionResult: boolean = false

    const TestComponent = () => {
      const { client } = useAblyClient()
      useRealtimeSubscriptions()

      // Verify we can get a channel
      if (client) {
        const channel = client.channels.get('reports')
        subscriptionResult = !!channel
      }

      return <div>Test</div>
    }

    renderWithProviders(<TestComponent />)

    expect(subscriptionResult).toBe(true)
  })

  it('should handle channel subscription and publishing', () => {
    let messageReceived: boolean = false

    const TestComponent = () => {
      const { client } = useAblyClient()

      if (client) {
        const channel = client.channels.get('test-channel')

        // Subscribe to an event
        channel.subscribe('test-event', () => {
          messageReceived = true
        })

        // Publish a message
        channel.publish('test-event', { data: 'test' })
      }

      return <div>{messageReceived ? 'Message received' : 'Waiting'}</div>
    }

    renderWithProviders(<TestComponent />)

    expect(messageReceived).toBe(true)
  })

  it('should work without RealtimeProvider when skipQueryClient is true', () => {
    const TestComponent = () => {
      return <div>Component without realtime</div>
    }

    const { container } = renderWithProviders(<TestComponent />, {
      skipQueryClient: true
    })

    expect(container.querySelector('div')).toBeInTheDocument()
  })
})
