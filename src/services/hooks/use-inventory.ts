import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { WebApi } from '@/generated/api'
import { PaginatedInventoriesResponse } from '@/generated/models'
import { apiClient } from '../api-client'

const webApi = new WebApi(undefined, '', apiClient)

export const INVENTORY_QUERY_KEY = 'inventory'

export const useInventory = (mockData?: unknown) => {
  const queryOptions: UseQueryOptions<PaginatedInventoriesResponse> = {
    queryKey: [INVENTORY_QUERY_KEY],
    queryFn: async () => {
      const response = await webApi.getInventoriesBffWebInventoriesGet({})
      return response.data
    }
  }

  if (process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && mockData) {
    queryOptions.initialData = mockData as PaginatedInventoriesResponse
  }

  return useQuery<PaginatedInventoriesResponse>(queryOptions)
}

export const useAddToInventory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['add-to-inventory'],
    mutationFn: async (params: {
      product_id: string
      warehouse_id: string
      total_quantity: number
      batch_number: string
      expiration_date: string
    }) => {
      const response = await webApi.createInventoryBffWebInventoryPost({
        productId: params.product_id,
        warehouseId: params.warehouse_id,
        totalQuantity: params.total_quantity,
        batchNumber: params.batch_number,
        expirationDate: params.expiration_date
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] })
    }
  })
}
