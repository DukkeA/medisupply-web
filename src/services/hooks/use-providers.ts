import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { WebApi } from '@/generated/api'
import {
  ProviderCreate,
  ProviderCreateResponse,
  PaginatedProvidersResponse
} from '@/generated/models'
import { apiClient } from '../api-client'

const webApi = new WebApi(undefined, '', apiClient)

export const PROVIDERS_QUERY_KEY = 'providers'

export const useProviders = (limit = 10, offset = 0, mockData?: unknown) => {
  const queryOptions: UseQueryOptions<PaginatedProvidersResponse> = {
    queryKey: [PROVIDERS_QUERY_KEY, limit, offset],
    queryFn: async () => {
      const response = await webApi.getProvidersBffWebProvidersGet({
        limit,
        offset
      })
      return response.data
    }
  }

  if (process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && mockData) {
    queryOptions.initialData = mockData as PaginatedProvidersResponse
  }

  return useQuery<PaginatedProvidersResponse>(queryOptions)
}

export const useCreateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation<ProviderCreateResponse, Error, ProviderCreate>({
    mutationKey: ['create-provider'],
    mutationFn: async (newProvider: ProviderCreate) => {
      const response = await webApi.createProviderBffWebProviderPost({
        providerCreate: newProvider
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_QUERY_KEY] })
    }
  })
}
