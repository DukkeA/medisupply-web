import axios, { AxiosInstance, AxiosError } from 'axios'

export interface ApiError {
  message: string
  status?: number
  errors?: unknown
}

const getBaseURL = (): string => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL
  if (!baseURL) {
    console.warn(
      'NEXT_PUBLIC_API_URL is not defined. Falling back to http://localhost'
    )
    return 'http://localhost'
  }
  return baseURL
}

const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    withCredentials: true
  })

  instance.interceptors.request.use(
    (config) => {
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    (response) => {
      return response
    },
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: error.message,
        status: error.response?.status,
        errors: error.response?.data
      }

      if (error.response) {
        switch (error.response.status) {
          case 400:
            apiError.message = 'Invalid request data'
            break
          case 404:
            apiError.message = 'Resource not found'
            break
          case 422:
            apiError.message = 'Validation error'
            break
          case 500:
            apiError.message = 'Server error occurred'
            break
          default:
            apiError.message = 'An unexpected error occurred'
        }
      } else if (error.request) {
        apiError.message = 'No response from server'
      }

      return Promise.reject(apiError)
    }
  )

  return instance
}

export const apiClient = createApiClient()
