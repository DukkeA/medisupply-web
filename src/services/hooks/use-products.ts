import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from '@tanstack/react-query'
import { WebApi } from '@/generated/api'
import {
  ProductCreate,
  ProductResponse,
  PaginatedProductsResponse,
  BatchProductsResponse
} from '@/generated/models'
import { apiClient } from '../api-client'

const webApi = new WebApi(undefined, '', apiClient)

export const PRODUCTS_QUERY_KEY = 'products'

export const useProducts = (limit = 10, offset = 0, mockData?: unknown) => {
  const queryOptions: UseQueryOptions<PaginatedProductsResponse> = {
    queryKey: [PRODUCTS_QUERY_KEY, limit, offset],
    queryFn: async () => {
      const response = await webApi.getProductsBffWebProductsGet({
        limit,
        offset
      })
      return response.data
    }
  }

  if (process.env.NEXT_PUBLIC_MOCK_DATA === 'true' && mockData) {
    queryOptions.initialData = mockData as PaginatedProductsResponse
  }

  return useQuery<PaginatedProductsResponse>(queryOptions)
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation<ProductResponse, Error, ProductCreate>({
    mutationKey: ['create-product'],
    mutationFn: async (newProduct: ProductCreate) => {
      const response = await webApi.createProductBffWebProductsPost({
        productCreate: newProduct
      })
      return response.data.created![0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
    }
  })
}

export const useUploadProductsCSV = () => {
  const queryClient = useQueryClient()

  return useMutation<BatchProductsResponse, Error, File>({
    mutationKey: ['upload-products-csv'],
    mutationFn: async (csvFile: File) => {
      const response =
        await webApi.createProductsFromCsvBffWebProductsBatchPost({
          file: csvFile
        })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] })
    }
  })
}
