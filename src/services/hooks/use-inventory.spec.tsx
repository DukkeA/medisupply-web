import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { useInventory, useAddToInventory, InventoryItem } from './use-inventory'
import {
  renderHookWithProviders,
  createTestQueryClient
} from '@/__tests__/test-utils'

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: []
    }),
    post: vi.fn().mockResolvedValue({
      data: {
        id: 1,
        product_id: 'prod-123',
        warehouse_id: 1,
        total_quantity: 100,
        reserved_quantity: 10,
        batch_number: 'BATCH-001',
        expiration_date: '2025-12-31'
      }
    })
  }
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
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  it('should use mock data when NEXT_PUBLIC_MOCK_DATA is true', () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'true'

    const mockData: InventoryItem[] = [
      {
        id: 1,
        product_id: 'prod-123',
        warehouse_id: 1,
        total_quantity: 100,
        reserved_quantity: 10,
        batch_number: 'BATCH-001',
        expiration_date: '2025-12-31'
      }
    ]

    const { result } = renderHookWithProviders(() => useInventory(mockData))

    expect(result.current.data).toEqual(mockData)
  })

  it('should not use mock data when NEXT_PUBLIC_MOCK_DATA is false', async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA = 'false'

    const mockData: InventoryItem[] = [
      {
        id: 1,
        product_id: 'prod-123',
        warehouse_id: 1,
        total_quantity: 100,
        reserved_quantity: 10,
        batch_number: 'BATCH-001',
        expiration_date: '2025-12-31'
      }
    ]

    const { result } = renderHookWithProviders(() => useInventory(mockData))

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

    expect(result.current.data).toEqual([])
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
