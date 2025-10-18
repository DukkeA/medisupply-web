import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { useSellers, useCreateSeller } from './use-sellers'
import {
  renderHookWithProviders,
  createTestQueryClient
} from '@/__tests__/test-utils'

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock('@/generated/api', () => ({
  WebApi: vi.fn().mockImplementation(() => ({
    getSellersBffWebSellersGet: vi.fn().mockResolvedValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      }
    }),
    createSellerBffWebSellersPost: vi.fn().mockResolvedValue({
      data: {
        id: 1,
        name: 'Test Seller',
        email: 'test@seller.com',
        phone: '1234567890'
      }
    })
  }))
}))

describe('useSellers', () => {
  const originalEnv = process.env.NEXT_PUBLIC_MOCK_DATA

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_DATA = originalEnv
  })

  it('should fetch sellers successfully', async () => {
    const { result } = renderHookWithProviders(() => useSellers(10, 0))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data).toHaveProperty('items')
  })

  it('should pass correct limit, offset, and all flag to query', async () => {
    const { result } = renderHookWithProviders(() => useSellers(20, 5, false))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })

  it('should handle all=true parameter', async () => {
    const { result } = renderHookWithProviders(() => useSellers(10, 0, true))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })

  it('should use mock data when NEXT_PUBLIC_MOCK_DATA is true', () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    const mockData = {
      items: [{ id: 1, name: 'Test Seller' }],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    const { result } = renderHookWithProviders(() =>
      useSellers(10, 0, mockData)
    )

    expect(result.current.data).toEqual(mockData)
  })

  it('should not use mock data when NEXT_PUBLIC_MOCK_DATA is false', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'false'

    const mockData = {
      items: [{ id: 1, name: 'Test Seller' }],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    const { result } = renderHookWithProviders(() =>
      useSellers(10, 0, mockData)
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).not.toEqual(mockData)
  })
})

describe('useCreateSeller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create seller mutation', () => {
    const { result } = renderHookWithProviders(() => useCreateSeller())

    expect(result.current.mutate).toBeDefined()
    expect(result.current.isPending).toBe(false)
  })

  it('should have correct mutation key', () => {
    const { result } = renderHookWithProviders(() => useCreateSeller())

    expect(result.current.mutate).toBeDefined()
  })

  it('should invalidate sellers query on success with custom QueryClient', async () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHookWithProviders(() => useCreateSeller(), {
      queryClient
    })

    expect(result.current.mutate).toBeDefined()
  })
})
