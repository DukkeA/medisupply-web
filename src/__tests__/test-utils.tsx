import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, type RenderHookOptions } from '@testing-library/react'

/**
 * Creates a QueryClient for testing with sensible defaults
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0
      },
      mutations: {
        retry: false
      }
    }
  })
}

/**
 * Creates a React Query wrapper for testing hooks
 * Disables retries and configures for test environment
 */
export const createQueryClientWrapper = () => {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  Wrapper.displayName = 'QueryClientWrapper'

  return Wrapper
}

interface RenderHookWithProvidersOptions<TProps>
  extends Omit<RenderHookOptions<TProps>, 'wrapper'> {
  /**
   * Custom QueryClient instance (optional)
   * If not provided, a new test QueryClient will be created
   */
  queryClient?: QueryClient
  /**
   * Additional wrapper components to nest
   * Will be wrapped inside QueryClientProvider
   */
  additionalWrappers?: React.ComponentType<{ children: ReactNode }>[]
}

/**
 * Renders a hook with all necessary providers (QueryClient, etc.)
 *
 * @example
 * ```tsx
 * const { result } = renderHookWithProviders(() => useProducts())
 * ```
 *
 * @example With custom QueryClient
 * ```tsx
 * const queryClient = createTestQueryClient()
 * const { result } = renderHookWithProviders(() => useProducts(), { queryClient })
 * ```
 *
 * @example With additional wrappers
 * ```tsx
 * const { result } = renderHookWithProviders(() => useMyHook(), {
 *   additionalWrappers: [ThemeProvider, AuthProvider]
 * })
 * ```
 */
export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: RenderHookWithProvidersOptions<TProps>
) {
  const { queryClient, additionalWrappers, ...renderOptions } = options || {}

  const testQueryClient = queryClient || createTestQueryClient()

  const AllProviders = ({ children }: { children: ReactNode }) => {
    let wrappedChildren = children

    // Wrap with additional providers from innermost to outermost
    if (additionalWrappers && additionalWrappers.length > 0) {
      wrappedChildren = additionalWrappers.reduceRight(
        (acc, Wrapper) => <Wrapper>{acc}</Wrapper>,
        children
      )
    }

    // QueryClientProvider is always the outermost provider
    return (
      <QueryClientProvider client={testQueryClient}>
        {wrappedChildren}
      </QueryClientProvider>
    )
  }

  AllProviders.displayName = 'AllProvidersWrapper'

  return renderHook(hook, {
    wrapper: AllProviders,
    ...renderOptions
  })
}
