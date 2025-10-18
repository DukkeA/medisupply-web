import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { WebApi } from '@/generated/api'
import {
  SellerCreate,
  SellerCreateResponse,
  ResponseGetSellersBffWebSellersGet
} from '@/generated/models'
import { apiClient } from '../api-client'

const webApi = new WebApi(undefined, '', apiClient)

export const SELLERS_QUERY_KEY = 'sellers'

export const useSellers = (limit = 10, offset = 0, mockData?: unknown) => {
  const queryOptions: UseQueryOptions<ResponseGetSellersBffWebSellersGet> = {
    queryKey: [SELLERS_QUERY_KEY, limit, offset],
    queryFn: async () => {
      const response = await webApi.getSellersBffWebSellersGet({
        limit,
        offset
      })
      return response.data
    }
  }

  if (process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && mockData) {
    queryOptions.initialData = mockData as ResponseGetSellersBffWebSellersGet
  }

  return useQuery<ResponseGetSellersBffWebSellersGet>(queryOptions)
}

export const useCreateSeller = () => {
  const queryClient = useQueryClient()

  return useMutation<SellerCreateResponse, Error, SellerCreate>({
    mutationKey: ['create-seller'],
    mutationFn: async (newSeller: SellerCreate) => {
      const response = await webApi.createSellerBffWebSellersPost({
        sellerCreate: newSeller
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SELLERS_QUERY_KEY] })
    }
  })
}
