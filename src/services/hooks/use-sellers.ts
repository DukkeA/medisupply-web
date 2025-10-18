import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { SellersApi } from '@/generated/api'
import {
  SellerCreate,
  SellerCreateResponse,
  SellerResponse,
  PaginatedSellersResponse
} from '@/generated/models'
import { apiClient } from '../api-client'

const sellersApi = new SellersApi(undefined, '', apiClient)

export const SELLERS_QUERY_KEY = 'sellers'

export const useSellers = (
  limit = 10,
  offset = 0,
  all = false,
  mockData?: unknown
) => {
  const queryOptions: UseQueryOptions<
    PaginatedSellersResponse | SellerResponse[]
  > = {
    queryKey: [SELLERS_QUERY_KEY, limit, offset, all],
    queryFn: async () => {
      const response = await sellersApi.getSellersBffWebSellersGet({
        limit,
        offset,
        all
      })
      return response.data
    }
  }

  if (process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && mockData) {
    queryOptions.initialData = mockData as
      | PaginatedSellersResponse
      | SellerResponse[]
  }

  return useQuery<PaginatedSellersResponse | SellerResponse[]>(queryOptions)
}

export const useCreateSeller = () => {
  const queryClient = useQueryClient()

  return useMutation<SellerCreateResponse, Error, SellerCreate>({
    mutationKey: ['create-seller'],
    mutationFn: async (newSeller: SellerCreate) => {
      const response = await sellersApi.createSellerBffWebSellersPost({
        sellerCreate: newSeller
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SELLERS_QUERY_KEY] })
    }
  })
}
