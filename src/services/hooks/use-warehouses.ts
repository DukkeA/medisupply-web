import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { WebApi } from '@/generated/api'
import {
  WarehouseCreate,
  WarehouseCreateResponse,
  PaginatedWarehousesResponse
} from '@/generated/models'
import { apiClient } from '../api-client'

const webApi = new WebApi(undefined, '', apiClient)

export const WAREHOUSES_QUERY_KEY = 'warehouses'

export const useWarehouses = (limit = 10, offset = 0, mockData?: unknown) => {
  const queryOptions: UseQueryOptions<PaginatedWarehousesResponse> = {
    queryKey: [WAREHOUSES_QUERY_KEY, limit, offset],
    queryFn: async () => {
      const response = await webApi.getWarehousesBffWebWarehousesGet({
        limit,
        offset
      })
      return response.data
    }
  }

  if (process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && mockData) {
    queryOptions.initialData = mockData as PaginatedWarehousesResponse
  }

  return useQuery<PaginatedWarehousesResponse>(queryOptions)
}

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient()

  return useMutation<WarehouseCreateResponse, Error, WarehouseCreate>({
    mutationKey: ['create-warehouse'],
    mutationFn: async (newWarehouse: WarehouseCreate) => {
      const response = await webApi.createWarehouseBffWebWarehousePost({
        warehouseCreate: newWarehouse
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WAREHOUSES_QUERY_KEY] })
    }
  })
}
