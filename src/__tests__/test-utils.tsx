import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  renderHook,
  type RenderHookOptions,
  render,
  type RenderOptions
} from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messagesEs from '../../messages/es.json'
import messagesEn from '../../messages/en.json'
import { RealtimeProvider } from '@/lib/realtime'
import { AuthProvider } from '@/contexts/AuthContext'

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

interface RenderHookWithProvidersOptions<TProps>
  extends Omit<RenderHookOptions<TProps>, 'wrapper'> {
  /**
   * Custom QueryClient instance (optional)
   * If not provided, a new test QueryClient will be created
   */
  queryClient?: QueryClient
  /**
   * Include RealtimeProvider (Ably) wrapper (optional)
   * Defaults to true
   */
  includeRealtimeProvider?: boolean
  /**
   * Additional wrapper components to nest
   * Will be wrapped inside QueryClientProvider
   */
  additionalWrappers?: React.ComponentType<{ children: ReactNode }>[]
}

/**
 * Renders a hook with all necessary providers (QueryClient, Realtime, etc.)
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
 *
 * @example Without RealtimeProvider
 * ```tsx
 * const { result } = renderHookWithProviders(() => useMyHook(), {
 *   includeRealtimeProvider: false
 * })
 * ```
 */
export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: RenderHookWithProvidersOptions<TProps>
) {
  const {
    queryClient,
    additionalWrappers,
    includeRealtimeProvider = true,
    ...renderOptions
  } = options || {}

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

    // Wrap with RealtimeProvider inside QueryClientProvider (since it needs useQueryClient)
    if (includeRealtimeProvider) {
      wrappedChildren = <RealtimeProvider>{wrappedChildren}</RealtimeProvider>
    }

    // QueryClientProvider is always the outermost provider
    // RealtimeProvider is placed inside since it uses useQueryClient()
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

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Custom QueryClient instance (optional)
   * If not provided, a new test QueryClient will be created
   */
  queryClient?: QueryClient
  /**
   * Locale for next-intl (defaults to 'es')
   */
  locale?: string
  /**
   * Custom messages for next-intl (optional)
   * If not provided, uses Spanish messages from @/messages/es.json
   */
  customMessages?: Record<string, unknown>
  /**
   * Include RealtimeProvider (Ably) wrapper (optional)
   * Defaults to true
   */
  includeRealtimeProvider?: boolean
  /**
   * Include AuthProvider wrapper (optional)
   * Defaults to true
   */
  includeAuthProvider?: boolean
  /**
   * Additional wrapper components to nest (e.g., SidebarProvider, ThemeProvider)
   * Will be wrapped inside QueryClientProvider and NextIntlClientProvider
   */
  additionalWrappers?: React.ComponentType<{ children: ReactNode }>[]
  /**
   * Skip QueryClient provider (useful for components that don't need React Query)
   */
  skipQueryClient?: boolean
}

/**
 * Renders a component with all necessary providers (QueryClient, NextIntl, Realtime)
 * Uses real Spanish messages by default
 *
 * @example Basic usage
 * ```tsx
 * renderWithProviders(<MyComponent />)
 * ```
 *
 * @example With custom QueryClient
 * ```tsx
 * const queryClient = createTestQueryClient()
 * renderWithProviders(<MyComponent />, { queryClient })
 * ```
 *
 * @example With additional wrappers (e.g., SidebarProvider)
 * ```tsx
 * import { SidebarProvider } from '@/components/ui/sidebar'
 * renderWithProviders(<AppSidebar />, {
 *   additionalWrappers: [SidebarProvider]
 * })
 * ```
 *
 * @example Without QueryClient (for components that don't use React Query)
 * ```tsx
 * renderWithProviders(<PureComponent />, { skipQueryClient: true })
 * ```
 *
 * @example Without RealtimeProvider
 * ```tsx
 * renderWithProviders(<MyComponent />, { includeRealtimeProvider: false })
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderWithProvidersOptions
) {
  const {
    queryClient,
    locale = 'es',
    customMessages,
    additionalWrappers,
    skipQueryClient = false,
    includeRealtimeProvider = !skipQueryClient, // Only include RealtimeProvider if QueryClient is enabled
    includeAuthProvider = true,
    ...renderOptions
  } = options || {}

  const testQueryClient = queryClient || createTestQueryClient()

  // Select messages based on locale
  const defaultMessages = locale === 'en' ? messagesEn : messagesEs
  const intlMessages = customMessages || defaultMessages

  const AllProviders = ({ children }: { children: ReactNode }) => {
    let wrappedChildren = children

    // Wrap with AuthProvider (needed for components using useAuth hook)
    if (includeAuthProvider) {
      wrappedChildren = <AuthProvider>{wrappedChildren}</AuthProvider>
    }

    // Wrap with additional providers from innermost to outermost
    if (additionalWrappers && additionalWrappers.length > 0) {
      wrappedChildren = additionalWrappers.reduceRight(
        (acc, Wrapper) => <Wrapper>{acc}</Wrapper>,
        wrappedChildren
      )
    }

    // Wrap with NextIntl
    wrappedChildren = (
      <NextIntlClientProvider locale={locale} messages={intlMessages}>
        {wrappedChildren}
      </NextIntlClientProvider>
    )

    // Wrap with RealtimeProvider inside QueryClientProvider (since it needs useQueryClient)
    // RealtimeProvider is only included if QueryClientProvider is enabled
    if (includeRealtimeProvider && !skipQueryClient) {
      wrappedChildren = <RealtimeProvider>{wrappedChildren}</RealtimeProvider>
    }

    // Optionally wrap with QueryClient (outermost, since RealtimeProvider uses useQueryClient)
    if (!skipQueryClient) {
      wrappedChildren = (
        <QueryClientProvider client={testQueryClient}>
          {wrappedChildren}
        </QueryClientProvider>
      )
    }

    return <>{wrappedChildren}</>
  }

  AllProviders.displayName = 'AllComponentProviders'

  return render(ui, {
    wrapper: AllProviders,
    ...renderOptions
  })
}
