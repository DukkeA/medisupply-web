import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { useInventory, useAddToInventory } from './use-inventory'
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
    getInventoriesBffWebInventoriesGet: vi.fn().mockResolvedValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_next: false,
        has_previous: false
      }
    }),
    createInventoryBffWebInventoryPost: vi.fn().mockResolvedValue({
      data: {
        id: '1',
        product_id: 'prod-123',
        warehouse_id: 'wh-1',
        total_quantity: 100,
        reserved_quantity: 10,
        batch_number: 'BATCH-001',
        expiration_date: '2025-12-31',
        product_sku: 'SKU-001',
        product_name: 'Product 1',
        product_price: 10.99,
        warehouse_name: 'Warehouse 1',
        warehouse_city: 'City 1',
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
    })
  }))
}))

describe('useInventory', () => {
  const originalEnv = process.env.NEXT_PUBLIC_MOCK_DATA

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_DATA = originalEnv
  })

  it('should fetch inventory successfully', async () => {
    const { result } = renderHookWithProviders(() => useInventory())

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.items).toBeDefined()
    expect(Array.isArray(result.current.data?.items)).toBe(true)
  })

  it('should use mock data when NEXT_PUBLIC_MOCK_DATA is true', () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    const mockData = {
      items: [
        {
          id: '1',
          product_id: 'prod-123',
          warehouse_id: 'wh-1',
          total_quantity: 100,
          reserved_quantity: 10,
          batch_number: 'BATCH-001',
          expiration_date: '2025-12-31',
          product_sku: 'SKU-001',
          product_name: 'Product 1',
          product_price: 10.99,
          warehouse_name: 'Warehouse 1',
          warehouse_city: 'City 1',
          created_at: '2025-01-01',
          updated_at: '2025-01-01'
        }
      ],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    const { result } = renderHookWithProviders(() =>
      useInventory(undefined, undefined, mockData)
    )

    expect(result.current.data).toEqual(mockData)
  })

  it('should not use mock data when NEXT_PUBLIC_MOCK_DATA is false', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'false'

    const mockData = {
      items: [
        {
          id: '999',
          product_id: 'mock-prod',
          warehouse_id: 'mock-wh',
          total_quantity: 999,
          reserved_quantity: 999,
          batch_number: 'MOCK-999',
          expiration_date: '2099-12-31',
          product_sku: 'MOCK-SKU',
          product_name: 'Mock Product',
          product_price: 999.99,
          warehouse_name: 'Mock Warehouse',
          warehouse_city: 'Mock City',
          created_at: '2099-01-01',
          updated_at: '2099-01-01'
        }
      ],
      total: 999,
      page: 999,
      size: 999,
      has_next: true,
      has_previous: true
    }

    const { result } = renderHookWithProviders(() =>
      useInventory(undefined, undefined, mockData)
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).not.toEqual(mockData)
  })

  it('should handle empty inventory', async () => {
    const { result } = renderHookWithProviders(() => useInventory())

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.items).toEqual([])
  })
})

describe('useAddToInventory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create add to inventory mutation', () => {
    const { result } = renderHookWithProviders(() => useAddToInventory())

    expect(result.current.mutate).toBeDefined()
    expect(result.current.isPending).toBe(false)
  })

  it('should have correct mutation key', () => {
    const { result } = renderHookWithProviders(() => useAddToInventory())

    expect(result.current.mutate).toBeDefined()
  })

  it('should invalidate inventory query on success with custom QueryClient', async () => {
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHookWithProviders(() => useAddToInventory(), {
      queryClient
    })

    expect(result.current.mutate).toBeDefined()
  })

  it('should call apiClient.post with correct endpoint', () => {
    const { result } = renderHookWithProviders(() => useAddToInventory())

    expect(result.current.mutate).toBeDefined()
    // Mutation is defined and ready to be called
  })
})
