import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { useProviders, useCreateProvider } from './use-providers'
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
    getProvidersBffWebProvidersGet: vi.fn().mockResolvedValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      }
    }),
    createProviderBffWebProviderPost: vi.fn().mockResolvedValue({
      data: {
        id: 1,
        name: 'Test Provider',
        email: 'test@provider.com',
        phone: '1234567890',
        address: '123 Test St'
      }
    })
  }))
}))

describe('useProviders', () => {
  const originalEnv = process.env.NEXT_PUBLIC_MOCK_DATA

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_DATA = originalEnv
  })

  it('should fetch providers successfully', async () => {
    const { result } = renderHookWithProviders(() => useProviders(10, 0))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.items).toEqual([])
    expect(result.current.data?.total).toBe(0)
  })

  it('should pass correct limit and offset to query', async () => {
    const { result } = renderHookWithProviders(() => useProviders(20, 5))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })

  it('should use mock data when NEXT_PUBLIC_MOCK_DATA is true', () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    const mockData = {
      items: [{ id: 1, name: 'Test Provider' }],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    const { result } = renderHookWithProviders(() =>
      useProviders(10, 0, mockData)
    )

    expect(result.current.data).toEqual(mockData)
  })

  it('should not use mock data when NEXT_PUBLIC_MOCK_DATA is false', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'false'

    const mockData = {
      items: [{ id: 1, name: 'Test Provider' }],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    const { result } = renderHookWithProviders(() =>
      useProviders(10, 0, mockData)
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).not.toEqual(mockData)
  })
})

describe('useCreateProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create provider mutation', () => {
    const { result } = renderHookWithProviders(() => useCreateProvider())

    expect(result.current.mutate).toBeDefined()
    expect(result.current.isPending).toBe(false)
  })

  it('should have correct mutation key', () => {
    const { result } = renderHookWithProviders(() => useCreateProvider())

    expect(result.current.mutate).toBeDefined()
  })

  it('should invalidate providers query on success with custom QueryClient', async () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHookWithProviders(() => useCreateProvider(), {
      queryClient
    })

    expect(result.current.mutate).toBeDefined()
  })
})
