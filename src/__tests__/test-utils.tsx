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
 * Renders a component with all necessary providers (QueryClient, NextIntl)
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
    ...renderOptions
  } = options || {}

  const testQueryClient = queryClient || createTestQueryClient()

  // Select messages based on locale
  const defaultMessages = locale === 'en' ? messagesEn : messagesEs
  const intlMessages = customMessages || defaultMessages

  const AllProviders = ({ children }: { children: ReactNode }) => {
    let wrappedChildren = children

    // Wrap with additional providers from innermost to outermost
    if (additionalWrappers && additionalWrappers.length > 0) {
      wrappedChildren = additionalWrappers.reduceRight(
        (acc, Wrapper) => <Wrapper>{acc}</Wrapper>,
        children
      )
    }

    // Wrap with NextIntl
    wrappedChildren = (
      <NextIntlClientProvider locale={locale} messages={intlMessages}>
        {wrappedChildren}
      </NextIntlClientProvider>
    )

    // Optionally wrap with QueryClient (outermost)
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
