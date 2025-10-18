import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { apiClient } from '../api-client'

export interface InventoryItem {
  id: number
  product_id: string
  warehouse_id: number
  total_quantity: number
  reserved_quantity: number
  batch_number: string
  expiration_date: string
}

export interface AddToInventoryRequest {
  product_id: string
  warehouse_id: number
  total_quantity: number
  reserved_quantity: number
  batch_number: string
  expiration_date: string
}

export const INVENTORY_QUERY_KEY = 'inventory'

export const useInventory = (mockData?: unknown) => {
  const queryOptions: UseQueryOptions<InventoryItem[]> = {
    queryKey: [INVENTORY_QUERY_KEY],
    queryFn: async () => {
      const response = await apiClient.get<InventoryItem[]>('/inventory')
      return response.data
    }
  }

  if (process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && mockData) {
    queryOptions.initialData = mockData as InventoryItem[]
  }

  return useQuery<InventoryItem[]>(queryOptions)
}

export const useAddToInventory = () => {
  const queryClient = useQueryClient()

  return useMutation<InventoryItem, Error, AddToInventoryRequest>({
    mutationKey: ['add-to-inventory'],
    mutationFn: async (newInventoryItem: AddToInventoryRequest) => {
      const response = await apiClient.post<InventoryItem>(
        '/inventory',
        newInventoryItem
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] })
    }
  })
}
