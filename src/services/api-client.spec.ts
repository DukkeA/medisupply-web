import { describe, it, expect } from 'vitest'

describe('apiClient', () => {
  it('should be importable', async () => {
    const { apiClient } = await import('./api-client')
    expect(apiClient).toBeDefined()
  })

  it('should have axios instance methods', async () => {
    const { apiClient } = await import('./api-client')
    expect(apiClient.get).toBeDefined()
    expect(apiClient.post).toBeDefined()
    expect(apiClient.put).toBeDefined()
    expect(apiClient.delete).toBeDefined()
  })

  it('should have interceptors', async () => {
    const { apiClient } = await import('./api-client')
    expect(apiClient.interceptors).toBeDefined()
    expect(apiClient.interceptors.request).toBeDefined()
    expect(apiClient.interceptors.response).toBeDefined()
  })

  it('should not have hardcoded Content-Type header in defaults', async () => {
    const { apiClient } = await import('./api-client')
    // Axios auto-sets Content-Type based on data, so defaults should not have it hardcoded
    expect(apiClient.defaults.headers.common?.['Content-Type']).toBeUndefined()
  })

  it('should have withCredentials enabled', async () => {
    const { apiClient } = await import('./api-client')
    expect(apiClient.defaults.withCredentials).toBe(true)
  })

  it('should have timeout configured', async () => {
    const { apiClient } = await import('./api-client')
    expect(apiClient.defaults.timeout).toBe(30000)
  })
})
