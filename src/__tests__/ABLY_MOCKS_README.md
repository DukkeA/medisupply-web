# Ably Mocks Quick Reference

## What's Mocked

All Ably realtime functionality is automatically mocked for tests:

- **Ably SDK** (`ably` package) - Full mock implementation
- **Token API** (`@/generated/api/realtime/realtime`) - Mock token generation
- **RealtimeProvider** - Fully functional in tests with mocks

## Automatic Inclusion

RealtimeProvider is automatically included when using:

```tsx
renderWithProviders(<Component />)
renderHookWithProviders(() => useHook())
```

## Disable When Needed

```tsx
// Explicitly disable
renderWithProviders(<Component />, { includeRealtimeProvider: false })

// Automatically disabled when skipQueryClient is true
renderWithProviders(<Component />, { skipQueryClient: true })
```

## Mock Files Location

- Mock Ably SDK: `src/__mocks__/ably.ts`
- Mock Token API: `src/__mocks__/generated-realtime.ts`
- Global setup: `src/__tests__/global-mocks.tsx`

## Testing Ably Features

### Access Ably Client in Tests

```tsx
const TestComponent = () => {
  const { client, isConnected } = useAblyClient()
  return <div>{isConnected ? 'Connected' : 'Not connected'}</div>
}

renderWithProviders(<TestComponent />)
```

### Test Channel Subscriptions

```tsx
const TestComponent = () => {
  const { client } = useAblyClient()
  useRealtimeSubscriptions()

  if (client) {
    const channel = client.channels.get('reports')
    channel.subscribe('report.updated', () => {
      // Handle update
    })
  }

  return <div>Test</div>
}

renderWithProviders(<TestComponent />)
```

### Publish Test Messages

```tsx
const TestComponent = () => {
  const { client } = useAblyClient()

  if (client) {
    const channel = client.channels.get('test-channel')
    channel.publish('test-event', { data: 'test' })
  }

  return <div>Test</div>
}

renderWithProviders(<TestComponent />)
```

## Mock Defaults

The Ably mock provides sensible defaults:

- Connection state: `'connected'`
- Token callback: Called automatically with mock token
- Channels: Created on demand with `channels.get(name)`
- Messages: Published and delivered synchronously

## Customization

Override mocks per test if needed:

```tsx
import { vi } from 'vitest'
import { generateTokenAuthAblyTokenPost } from '@/generated/api/realtime/realtime'

beforeEach(() => {
  vi.mocked(generateTokenAuthAblyTokenPost).mockClear()
})

it('tests token generation', async () => {
  vi.mocked(generateTokenAuthAblyTokenPost).mockResolvedValueOnce({
    token_request: {
      token: 'custom-token'
    }
  })
  // Test code here
})
```

## localStorage Setup

If your tests need an access token:

```tsx
import { vi } from 'vitest'

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => {
      if (key === 'access_token') return 'mock-token'
      return null
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  })
})
```

## Common Patterns

### Pattern 1: Basic Component with Realtime

```tsx
import { renderWithProviders } from '@/__tests__/test-utils'

it('renders with realtime', () => {
  renderWithProviders(<MyComponent />)
  expect(screen.getByText('Expected')).toBeInTheDocument()
})
```

### Pattern 2: Hook with Realtime

```tsx
import { renderHookWithProviders } from '@/__tests__/test-utils'

it('hook works with realtime', () => {
  const { result } = renderHookWithProviders(() => useMyHook())
  expect(result.current.data).toBeDefined()
})
```

### Pattern 3: Test Without Realtime

```tsx
import { renderWithProviders } from '@/__tests__/test-utils'

it('simple component', () => {
  renderWithProviders(<SimpleComponent />, {
    skipQueryClient: true
    // RealtimeProvider automatically disabled
  })
})
```

## Troubleshooting

| Issue                 | Solution                                             |
| --------------------- | ---------------------------------------------------- |
| "No QueryClient set"  | Don't use `skipQueryClient: true` with realtime code |
| Token not generated   | Mock localStorage with 'access_token'                |
| Channels not found    | Use `client.channels.get('channel-name')`            |
| Messages not received | Ensure you're subscribed before publishing           |

## See Also

- Full documentation: `ABLY_TESTING_SETUP.md`
- Test example: `src/lib/realtime/realtime-provider.spec.tsx`
- Test utils: `src/__tests__/test-utils.tsx`
