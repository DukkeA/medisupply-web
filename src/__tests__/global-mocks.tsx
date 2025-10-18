/**
 * Global mocks for testing
 *
 * This file contains centralized mocks that are automatically applied to all tests via setup.ts.
 *
 * ## What's Mocked Globally:
 * - **next-intl**: useTranslations returns keys as-is (e.g., t('hello') returns 'hello')
 * - **sonner**: Toast notifications (success, error, etc.)
 * - **UI components** (shadcn/ui): Button, Dialog, Input, Label, Popover, Command, Select, Form, Table, Calendar
 * - **Sidebar**: useSidebar hook with default state
 * - **LocationSelector**: Country/state selection component with default test behavior
 *
 * ## What's NOT Mocked (uses real implementation):
 * - **lucide-react**: Uses real icon components
 *
 * ## Usage in Tests:
 * These mocks are automatically applied via setup.ts. You don't need to manually import them
 * in your test files unless you want to override specific behavior.
 *
 * ## Overriding Mocks:
 * If a specific test needs different mock behavior, you can override by calling vi.mock()
 * in that test file - the local mock will take precedence over the global one.
 *
 * @example Override useSidebar in a specific test
 * ```typescript
 * vi.mock('@/components/ui/sidebar', async () => {
 *   const actual = await vi.importActual('@/components/ui/sidebar')
 *   return {
 *     ...actual,
 *     useSidebar: () => ({ isMobile: true }) // Custom for this test
 *   }
 * })
 * ```
 */

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  PropsWithChildren
} from 'react'
import { vi } from 'vitest'

/**
 * Setup next-intl mocks
 * Mocks useTranslations to return keys as-is (for simpler test assertions)
 * Preserves NextIntlClientProvider for use in renderWithProviders
 */
export function setupNextIntlMocks() {
  vi.mock('next-intl', async () => {
    const actual = await vi.importActual('next-intl')
    return {
      ...actual,
      useTranslations: () => (key: string) => key
    }
  })
}

/**
 * Setup sonner (toast) mocks
 */
export function setupSonnerMocks() {
  vi.mock('sonner', () => ({
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      loading: vi.fn(),
      promise: vi.fn(),
      custom: vi.fn()
    }
  }))
}

/**
 * Setup lucide-react icon mocks (OPTIONAL)
 * Note: In most cases, we don't need to mock lucide-react
 * The real icons work fine in tests. Only mock if you need
 * to customize icon behavior for specific tests.
 */
export function setupLucideReactMocks() {
  // Lucide-react icons work fine in tests, no mocking needed
  // If specific tests need mocked icons, they can override this locally
}

/**
 * Setup UI component mocks (shadcn/ui)
 * These are simple mock implementations that maintain basic functionality
 */
export function setupUIComponentMocks() {
  // Button
  vi.mock('@/components/ui/button', () => ({
    Button: ({
      children,
      ...props
    }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
      <button {...props}>{children}</button>
    )
  }))

  // Dialog
  vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children }: PropsWithChildren) => (
      <div role="dialog">{children}</div>
    ),
    DialogContent: ({
      children,
      ...props
    }: PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    DialogHeader: ({ children }: PropsWithChildren) => <div>{children}</div>,
    DialogTitle: ({ children }: PropsWithChildren) => <h2>{children}</h2>,
    DialogDescription: ({ children }: PropsWithChildren) => <p>{children}</p>,
    DialogFooter: ({ children }: PropsWithChildren) => <div>{children}</div>
  }))

  // Input
  vi.mock('@/components/ui/input', () => ({
    Input: (props: InputHTMLAttributes<HTMLInputElement>) => (
      <input {...props} />
    )
  }))

  // Label
  vi.mock('@/components/ui/label', () => ({
    Label: ({
      htmlFor,
      children
    }: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) => (
      <label htmlFor={htmlFor}>{children}</label>
    )
  }))

  // Popover
  vi.mock('@/components/ui/popover', () => ({
    Popover: ({ children }: PropsWithChildren) => <div>{children}</div>,
    PopoverTrigger: ({ children }: PropsWithChildren) => <div>{children}</div>,
    PopoverContent: ({ children }: PropsWithChildren) => <div>{children}</div>
  }))

  // Command
  vi.mock('@/components/ui/command', () => ({
    Command: ({ children }: PropsWithChildren) => <div>{children}</div>,
    CommandInput: (props: InputHTMLAttributes<HTMLInputElement>) => (
      <input {...props} />
    ),
    CommandList: ({ children }: PropsWithChildren) => <div>{children}</div>,
    CommandEmpty: ({ children }: PropsWithChildren) => <div>{children}</div>,
    CommandGroup: ({ children }: PropsWithChildren) => <div>{children}</div>,
    CommandItem: ({
      children,
      onSelect,
      ...props
    }: PropsWithChildren<{
      onSelect?: (value: string) => void
      value?: string
    }>) => (
      <div onClick={() => onSelect?.(props.value || '')} {...props}>
        {children}
      </div>
    )
  }))

  // Select
  vi.mock('@/components/ui/select', () => ({
    Select: ({ children }: PropsWithChildren) => <div>{children}</div>,
    SelectTrigger: ({ children }: PropsWithChildren) => (
      <button>{children}</button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => (
      <span>{placeholder}</span>
    ),
    SelectContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
    SelectItem: ({ children, value }: PropsWithChildren<{ value: string }>) => (
      <div data-value={value}>{children}</div>
    )
  }))

  // Form
  vi.mock('@/components/ui/form', () => ({
    Form: ({ children }: PropsWithChildren) => <form>{children}</form>,
    FormField: ({ children }: PropsWithChildren) => <div>{children}</div>,
    FormItem: ({ children }: PropsWithChildren) => <div>{children}</div>,
    FormLabel: ({ children }: PropsWithChildren) => <label>{children}</label>,
    FormControl: ({ children }: PropsWithChildren) => <div>{children}</div>,
    FormDescription: ({ children }: PropsWithChildren) => <p>{children}</p>,
    FormMessage: ({ children }: PropsWithChildren) => <span>{children}</span>
  }))

  // Table
  vi.mock('@/components/ui/table', () => ({
    Table: ({ children }: PropsWithChildren) => <table>{children}</table>,
    TableHeader: ({ children }: PropsWithChildren) => <thead>{children}</thead>,
    TableBody: ({ children }: PropsWithChildren) => <tbody>{children}</tbody>,
    TableFooter: ({ children }: PropsWithChildren) => <tfoot>{children}</tfoot>,
    TableRow: ({ children }: PropsWithChildren) => <tr>{children}</tr>,
    TableHead: ({ children }: PropsWithChildren) => <th>{children}</th>,
    TableCell: ({ children }: PropsWithChildren) => <td>{children}</td>,
    TableCaption: ({ children }: PropsWithChildren) => (
      <caption>{children}</caption>
    )
  }))

  // Calendar
  vi.mock('@/components/ui/calendar', () => ({
    Calendar: ({
      selected,
      onSelect
    }: {
      selected?: Date
      onSelect?: (date: Date) => void
    }) => (
      <div role="grid" onClick={() => onSelect?.(new Date())}>
        {selected?.toDateString()}
      </div>
    )
  }))
}

/**
 * Setup Sidebar component mocks
 * Provides default useSidebar implementation
 */
export function setupSidebarMocks() {
  vi.mock('@/components/ui/sidebar', async () => {
    const actual = await vi.importActual('@/components/ui/sidebar')
    return {
      ...actual,
      useSidebar: () => ({
        state: 'expanded',
        open: true,
        setOpen: vi.fn(),
        openMobile: false,
        setOpenMobile: vi.fn(),
        isMobile: false,
        toggleSidebar: vi.fn()
      })
    }
  })
}

/**
 * Setup LocationSelector (location-input) mock
 * Used for country/state selection in forms
 */
export function setupLocationSelectorMock() {
  vi.mock('@/components/ui/location-input', () => ({
    __esModule: true,
    default: ({
      onCountryChange,
      onStateChange,
      countryLabel,
      stateLabel,
      showStates
    }: {
      onCountryChange?: (c?: { name: string }) => void
      onStateChange?: (s?: { name: string }) => void
      countryLabel?: string
      stateLabel?: string
      showStates?: boolean
    }) => (
      <div>
        <button
          type="button"
          aria-label={countryLabel ?? 'country'}
          onClick={() => onCountryChange?.({ name: 'Colombia' })}
        >
          select-country
        </button>
        {showStates && (
          <button
            type="button"
            aria-label={stateLabel ?? 'state'}
            onClick={() => onStateChange?.({ name: 'Andina' })}
          >
            select-state
          </button>
        )}
      </div>
    )
  }))
}

/**
 * Apply all global mocks
 * This is called in setup.ts to automatically apply common mocks
 */
export function setupGlobalMocks() {
  setupNextIntlMocks()
  setupSonnerMocks()
  setupLucideReactMocks()
  setupUIComponentMocks()
  setupSidebarMocks()
  setupLocationSelectorMock()
}
