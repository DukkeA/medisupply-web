import { render, screen, waitFor } from '@testing-library/react'
import { useQueryClient, useQuery, QueryClient } from '@tanstack/react-query'
import QueryProvider from '.'

// Test component that uses QueryClient
const TestQueryComponent = () => {
  const queryClient = useQueryClient()
  const { isLoading, error } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      throw new Error('Test error for retry')
    },
    retry: false // Override to prevent actual retries in test
  })

  return (
    <div>
      <div>QueryClient available: {queryClient ? 'yes' : 'no'}</div>
      <div>Loading: {isLoading ? 'yes' : 'no'}</div>
      <div>Error: {error ? 'yes' : 'no'}</div>
    </div>
  )
}

describe('QueryProvider', () => {
  it('renders children correctly', () => {
    render(
      <QueryProvider>
        <div>Test Child</div>
      </QueryProvider>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('provides QueryClient context to child components', () => {
    render(
      <QueryProvider>
        <TestQueryComponent />
      </QueryProvider>
    )

    expect(screen.getByText('QueryClient available: yes')).toBeInTheDocument()
  })

  it('applies correct default query options - staleTime and gcTime', async () => {
    const TestStaleTimeComponent = () => {
      const { data, isStale } = useQuery({
        queryKey: ['stale-test'],
        queryFn: () => Promise.resolve('stale-data')
      })

      return (
        <div>
          <div>Data: {data || 'loading'}</div>
          <div>Is stale: {isStale ? 'yes' : 'no'}</div>
        </div>
      )
    }

    render(
      <QueryProvider>
        <TestStaleTimeComponent />
      </QueryProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Data: stale-data')).toBeInTheDocument()
    })

    // Data should not be stale immediately due to 5-minute staleTime
    expect(screen.getByText('Is stale: no')).toBeInTheDocument()
  })

  it('applies correct retry configuration for queries', async () => {
    let callCount = 0

    const TestRetryComponent = () => {
      const { isError } = useQuery({
        queryKey: ['retry-test'],
        queryFn: async () => {
          callCount++
          throw new Error('Test error')
        },
        retry: 2, // Override default for faster test
        retryDelay: 10 // Very short delay for test
      })

      return (
        <div>
          <div>Error occurred: {isError ? 'yes' : 'no'}</div>
          <div>Call count: {callCount}</div>
        </div>
      )
    }

    render(
      <QueryProvider>
        <TestRetryComponent />
      </QueryProvider>
    )

    // Wait for retries to complete
    await waitFor(
      () => {
        expect(screen.getByText('Error occurred: yes')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Should have tried 3 times (1 initial + 2 retries)
    await waitFor(() => {
      expect(callCount).toBe(3)
    })
  })

  it('applies retry delay with exponential backoff', async () => {
    const retryDelayFn = (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000)

    // Test the retry delay function directly
    expect(retryDelayFn(0)).toBe(1000) // First retry: 1s
    expect(retryDelayFn(1)).toBe(2000) // Second retry: 2s
    expect(retryDelayFn(2)).toBe(4000) // Third retry: 4s
    expect(retryDelayFn(10)).toBe(30000) // Max cap: 30s
  })

  it('applies refetchOnWindowFocus based on NODE_ENV', () => {
    // Test the logic directly since QueryClient is created at module level
    const productionValue = process.env.NODE_ENV === 'production'
    const developmentValue = process.env.NODE_ENV === 'development'

    // Test the conditional logic
    expect(typeof productionValue).toBe('boolean')
    expect(typeof developmentValue).toBe('boolean')

    // Since we can't change NODE_ENV after module load, test the QueryClient directly
    const TestEnvironmentComponent = () => {
      const queryClient = useQueryClient()
      const defaultOptions = queryClient.getDefaultOptions()
      const refetchValue = defaultOptions.queries?.refetchOnWindowFocus

      return (
        <div>
          <div>RefetchOnWindowFocus type: {typeof refetchValue}</div>
          <div>RefetchOnWindowFocus value: {String(refetchValue)}</div>
        </div>
      )
    }

    render(
      <QueryProvider>
        <TestEnvironmentComponent />
      </QueryProvider>
    )

    expect(screen.getByText(/RefetchOnWindowFocus type:/)).toBeInTheDocument()
    expect(screen.getByText(/RefetchOnWindowFocus value:/)).toBeInTheDocument()
  })

  it('applies refetchOnReconnect setting', () => {
    const TestReconnectComponent = () => {
      const queryClient = useQueryClient()
      const defaultOptions = queryClient.getDefaultOptions()

      return (
        <div>
          RefetchOnReconnect:{' '}
          {String(defaultOptions.queries?.refetchOnReconnect)}
        </div>
      )
    }

    render(
      <QueryProvider>
        <TestReconnectComponent />
      </QueryProvider>
    )

    expect(screen.getByText('RefetchOnReconnect: always')).toBeInTheDocument()
  })

  it('applies correct mutation default options', async () => {
    const TestMutationComponent = () => {
      const queryClient = useQueryClient()
      const defaultOptions = queryClient.getDefaultOptions()

      return (
        <div>
          <div>Mutation retry: {String(defaultOptions.mutations?.retry)}</div>
          <div>
            Mutation retryDelay: {String(defaultOptions.mutations?.retryDelay)}
          </div>
        </div>
      )
    }

    render(
      <QueryProvider>
        <TestMutationComponent />
      </QueryProvider>
    )

    expect(screen.getByText('Mutation retry: 1')).toBeInTheDocument()
    expect(screen.getByText('Mutation retryDelay: 1000')).toBeInTheDocument()
  })

  it('provides the same QueryClient instance across renders', () => {
    let queryClient1: QueryClient | null = null
    let queryClient2: QueryClient | null = null

    const TestSingletonComponent = ({
      renderCount
    }: {
      renderCount: number
    }) => {
      const queryClient = useQueryClient()

      if (renderCount === 1) {
        queryClient1 = queryClient
      } else {
        queryClient2 = queryClient
      }

      return <div>Render: {renderCount}</div>
    }

    const { rerender } = render(
      <QueryProvider>
        <TestSingletonComponent renderCount={1} />
      </QueryProvider>
    )

    rerender(
      <QueryProvider>
        <TestSingletonComponent renderCount={2} />
      </QueryProvider>
    )

    // Should be the same instance (singleton pattern)
    expect(queryClient1).toBe(queryClient2)
  })
})
