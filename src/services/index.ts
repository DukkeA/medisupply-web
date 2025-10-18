// Export only WebApi for web application endpoints
export { WebApi } from '@/generated/api'
export { apiClient } from './api-client'

// Export all hooks
export * from './hooks/use-inventory'
export * from './hooks/use-products'
export * from './hooks/use-providers'
export * from './hooks/use-sales-plans'
export * from './hooks/use-sellers'
export * from './hooks/use-warehouses'
