/**
 * Mock implementation of generated Ably token API for testing
 *
 * This mock provides a fake implementation of the token generation
 * endpoint without requiring actual API calls during tests.
 */

import { vi } from 'vitest'

export interface TokenResponse {
  token_request?: {
    token?: string
    keyName?: string
    clientId?: string
    mac?: string
    nonce?: string
    timestamp?: number
  }
  token?: string
  [key: string]: unknown
}

/**
 * Mock implementation of generateTokenAuthAblyTokenPost
 * Returns a valid-looking token request object for testing
 */
export const generateTokenAuthAblyTokenPost = vi.fn().mockResolvedValue({
  token_request: {
    token: 'mock-ably-token-string',
    keyName: 'mock-key-name',
    clientId: 'mock-client-id',
    mac: 'mock-mac-value',
    nonce: 'mock-nonce-' + Math.random().toString(36),
    timestamp: Date.now()
  }
} as TokenResponse)
