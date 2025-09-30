import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '.'

describe('useIsMobile', () => {
  let mockAddEventListener: ReturnType<typeof vi.fn>
  let mockRemoveEventListener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: vi.fn()
      }))
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return false for desktop width', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should return true for mobile width', () => {
    // Set mobile width (below 768px)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return true for exact mobile breakpoint boundary (767px)', () => {
    // Test exact boundary - 767px should be mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false for exact desktop breakpoint boundary (768px)', () => {
    // Test exact boundary - 768px should be desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should handle undefined initial state and update correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    const { result } = renderHook(() => useIsMobile())

    // Should return false (falsy value from !!undefined becomes false, then !!false becomes false)
    expect(result.current).toBe(false)
  })

  it('should respond to media query change events', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Get the change handler that was registered
    const changeHandler = mockAddEventListener.mock.calls[0][1]

    // Simulate window resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      })
      changeHandler()
    })

    expect(result.current).toBe(true)
  })

  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should call matchMedia with correct query', () => {
    const mockMatchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    })

    renderHook(() => useIsMobile())

    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })
})
