import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { WebApi } from '@/generated/api'
import {
  SalesPlanCreate,
  SalesPlanCreateResponse,
  PaginatedSalesPlansResponse
} from '@/generated/models'
import { apiClient } from '../api-client'

const webApi = new WebApi(undefined, '', apiClient)

export const SALES_PLANS_QUERY_KEY = 'sales-plans'

export const useSalesPlans = (limit = 10, offset = 0, mockData?: unknown) => {
  const queryOptions: UseQueryOptions<PaginatedSalesPlansResponse> = {
    queryKey: [SALES_PLANS_QUERY_KEY, limit, offset],
    queryFn: async () => {
      const response = await webApi.getSalesPlansBffWebSalesPlansGet({
        limit,
        offset
      })
      return response.data
    }
  }

  if (process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && mockData) {
    queryOptions.initialData = mockData as PaginatedSalesPlansResponse
  }

  return useQuery<PaginatedSalesPlansResponse>(queryOptions)
}

export const useCreateSalesPlan = () => {
  const queryClient = useQueryClient()

  return useMutation<SalesPlanCreateResponse, Error, SalesPlanCreate>({
    mutationKey: ['create-sales-plan'],
    mutationFn: async (newSalesPlan: SalesPlanCreate) => {
      const response = await webApi.createSalesPlanBffWebSalesPlansPost({
        salesPlanCreate: newSalesPlan
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_PLANS_QUERY_KEY] })
    }
  })
}
