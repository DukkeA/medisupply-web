import Axios, { AxiosRequestConfig, AxiosError } from 'axios'

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
})

// Request interceptor
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // Use id_token as per API requirements for /auth/me endpoint
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('id_token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('id_token')
        localStorage.removeItem('refresh_token')
        // Optionally redirect to login
      }
    }
    return Promise.reject(error)
  }
)

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source()
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token
  }).then(({ data }) => data)

  // @ts-expect-error - Adding cancel method to promise for react-query
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}

export default customInstance
