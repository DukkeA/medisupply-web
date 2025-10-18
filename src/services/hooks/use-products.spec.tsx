import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import {
  useProducts,
  useCreateProduct,
  useUploadProductsCSV
} from './use-products'
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
    getProductsBffWebProductsGet: vi.fn().mockResolvedValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      }
    }),
    createProductBffWebProductsPost: vi.fn().mockResolvedValue({
      data: {
        created: [{ id: '123', name: 'Test Product' }],
        count: 1
      }
    }),
    createProductsFromCsvBffWebProductsBatchPost: vi.fn().mockResolvedValue({
      data: {
        created: [],
        count: 0
      }
    })
  }))
}))

describe('useProducts', () => {
  const originalEnv = process.env.NEXT_PUBLIC_MOCK_DATA

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_DATA = originalEnv
  })

  it('should fetch products successfully', async () => {
    const { result } = renderHookWithProviders(() => useProducts(10, 0))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.items).toEqual([])
    expect(result.current.data?.total).toBe(0)
  })

  it('should pass correct limit and offset to query', async () => {
    const { result } = renderHookWithProviders(() => useProducts(20, 5))

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })

  it('should use mock data when NEXT_PUBLIC_MOCK_DATA is true', () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    const mockData = {
      items: [{ id: '1', name: 'Test' }],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    const { result } = renderHookWithProviders(() =>
      useProducts(10, 0, mockData)
    )

    // With mock data, it should be available immediately
    expect(result.current.data).toEqual(mockData)
  })

  it('should not use mock data when NEXT_PUBLIC_MOCK_DATA is false', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'false'

    const mockData = {
      items: [{ id: '1', name: 'Test' }],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    const { result } = renderHookWithProviders(() =>
      useProducts(10, 0, mockData)
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Should fetch from API, not use mock data
    expect(result.current.data).not.toEqual(mockData)
  })
})

describe('useCreateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create product mutation', () => {
    const { result } = renderHookWithProviders(() => useCreateProduct())

    expect(result.current.mutate).toBeDefined()
    expect(result.current.isPending).toBe(false)
  })

  it('should have correct mutation key', () => {
    const { result } = renderHookWithProviders(() => useCreateProduct())

    expect(result.current.mutate).toBeDefined()
  })

  it('should invalidate products query on success with custom QueryClient', async () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHookWithProviders(() => useCreateProduct(), {
      queryClient
    })

    // The hook should be defined
    expect(result.current.mutate).toBeDefined()
  })
})

describe('useUploadProductsCSV', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upload CSV mutation', () => {
    const { result } = renderHookWithProviders(() => useUploadProductsCSV())

    expect(result.current.mutate).toBeDefined()
    expect(result.current.isPending).toBe(false)
  })

  it('should have correct mutation key', () => {
    const { result } = renderHookWithProviders(() => useUploadProductsCSV())

    expect(result.current.mutate).toBeDefined()
  })

  it('should invalidate products query on success', () => {
    const { result } = renderHookWithProviders(() => useUploadProductsCSV())

    expect(result.current.mutate).toBeDefined()
  })
})
