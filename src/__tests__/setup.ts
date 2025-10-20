import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { setupGlobalMocks } from './global-mocks'

// Set environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock ResizeObserver (required for UI libraries in jsdom)
class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): ResizeObserverEntry[] {
    return []
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock
})

// Mock next/navigation (required for Next.js components)
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn()
}))

// Global test setup
// Vitest globals (describe, it, expect, vi) are automatically available
// when globals: true is set in vitest.config.ts

// Apply all global mocks (next-intl, sonner, lucide-react, UI components, sidebar, etc.)
setupGlobalMocks()
