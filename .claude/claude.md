# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediSupply Web is a Next.js 15 application for medical supply inventory management. It uses React 19, TypeScript, TailwindCSS 4, and React Query for state management. The application includes internationalization (i18n), real-time updates via Ably, and comprehensive testing with Vitest and Playwright.

## Development Commands

### Running the Application

```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production with Turbopack
npm start                # Start production server
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without modifying files
```

### Testing

```bash
# Unit/Integration Tests (Vitest)
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report

# E2E Tests (Playwright)
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run with Playwright UI
npm run test:e2e:headed  # Run in headed mode (see browser)
npm run test:e2e:debug   # Run in debug mode
```

### API Code Generation

```bash
npm run api:generate     # Generate API client from OpenAPI spec using Orval
```

The API generation connects to `http://localhost:8000/bff/openapi.json` by default and generates:

- React Query hooks in `src/generated/api/`
- TypeScript models in `src/generated/models/`

## Architecture

### App Structure

The application uses Next.js App Router with route groups:

- `src/app/(app)/` - Authenticated application routes (inventory, products, vendors, reports, routes)
- `src/app/(auth)/` - Authentication routes (login)

### Authentication Flow

1. **AuthContext** (`src/contexts/AuthContext.tsx`) manages authentication state
2. Uses **localStorage** for token storage:
   - `access_token` - API access token
   - `id_token` - Used in Authorization header (as required by backend)
   - `refresh_token` - For token refresh
3. **Middleware** (`middleware.ts`) checks for `auth-token` cookie and redirects to `/login` if missing
4. **Axios instance** (`src/lib/axios-instance.ts`) automatically:
   - Adds `id_token` to Authorization header
   - Handles 401 responses by clearing tokens

### API Client Architecture

The project uses **Orval** to auto-generate a type-safe API client from OpenAPI specs:

1. **Orval configuration** (`orval.config.ts`) defines:
   - Input: OpenAPI JSON from BFF service
   - Output: `src/generated/api/` (organized by tags) and `src/generated/models/`
   - Client: React Query hooks with axios
   - Custom mutator: `src/lib/axios-instance.ts` for auth injection

2. **Generated code** creates:
   - `useQuery` hooks for GET requests
   - `useMutation` hooks for POST/PUT/DELETE
   - `useInfinite` hooks for paginated data
   - `useSuspenseQuery` hooks for suspense mode
   - TypeScript interfaces for all models

3. **Custom axios instance** adds:
   - Automatic `id_token` injection in headers
   - Base URL from `NEXT_PUBLIC_API_URL` env variable
   - 401 error handling (clears auth and redirects)

**Important**: Never manually edit files in `src/generated/`. Regenerate using `npm run api:generate` when the API changes.

### Real-time Updates

The application uses **Ably** for real-time updates:

1. **Configuration** (`src/lib/realtime/config.ts`):
   - Centralized registry of channels and events
   - Maps events to React Query cache invalidation
   - User-specific channel: `web:{userId}`
   - Broadcast channel: `web:broadcasts`

2. **Provider** (`src/lib/realtime/realtime-provider.tsx`):
   - Wraps the app to enable real-time subscriptions
   - Automatically subscribes to configured channels
   - Invalidates React Query cache when events arrive

3. **Adding new real-time features**:
   - Add channel/event config in `src/lib/realtime/config.ts`
   - Specify which query keys to invalidate on each event
   - Provider automatically handles subscription and cache updates

### Component Organization

- `src/components/ui/` - shadcn/ui components (excluded from tests/coverage)
- `src/components/layout/` - Layout components (sidebar, breadcrumb, nav)
- `src/components/[feature]/` - Feature-specific components (inventory, products, vendors, reports)
- `src/components/providers/` - React context providers

Each feature component typically includes:

- Main component (e.g., `inventory-table.tsx`)
- Test file (e.g., `inventory-table.spec.tsx`)
- Modal/dialog components for CRUD operations

### State Management

- **React Query** (@tanstack/react-query) for server state
- **React Context** for auth and real-time subscriptions
- **Local component state** for UI state

### Internationalization (i18n)

- Uses `next-intl` configured in `src/i18n/request.ts`
- Translation files in `messages/` directory (en.json, es.json)
- Access translations via `useTranslations()` hook

### Routing & Navigation

- **Dynamic breadcrumbs** (`src/components/layout/dynamic-breadcrumb/`)
- **Route configuration** (`src/lib/route-config.ts`) - centralized route labels and breadcrumb visibility

## Testing Conventions

### Unit/Integration Tests (Vitest)

- **Location**: Co-located with components (e.g., `component.spec.tsx`)
- **Setup**: `src/__tests__/setup.ts` configures testing-library and jsdom
- **Coverage thresholds**: 90% for branches, functions, lines, statements
- **Excluded from coverage**:
  - `src/components/ui/` (shadcn components)
  - `src/generated/` (auto-generated API code)
  - `src/lib/` (utilities - add tests if business logic is added)
  - App Router files (page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx)
  - i18n configuration
  - Barrel files (index.ts/tsx)

### E2E Tests (Playwright)

- **Location**: `e2e/` directory
- **Pattern**: Page Object Model (POM)
  - `e2e/pages/` - Page objects (BasePage, LoginPage, InventoryPage, etc.)
  - `e2e/tests/` - Test specifications
  - `e2e/helpers/` - Shared test utilities
  - `e2e/fixtures/` - Test data fixtures
- **Environment**: Uses `.env.e2e` for E2E-specific configuration
- **Browsers**: Configured for Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Server**: Automatically starts dev server before tests (or production build in CI)

## Git Workflow

### Pre-commit Hook

Husky runs pre-commit checks on staged TypeScript/JavaScript files:

1. Prettier formatting check
2. ESLint with auto-fix
3. TypeScript type checking

All checks must pass before committing.

### CI/CD (GitHub Actions)

Located in `.github/workflows/`:

- **ci.yml** - Runs on all pushes/PRs: format check, lint, type check, tests with coverage, build
- **sonarcloud.yml** - Code quality analysis (gracefully skips if SONAR_TOKEN not configured)
- **pr-validation.yml** - Additional PR checks
- **release.yml** - Release automation

## Environment Variables

### Required

- `NEXT_PUBLIC_API_URL` - Backend BFF API URL (default: `http://localhost:8000`)

### Optional

- `NEXT_PUBLIC_MOCK_DATA` - Enable mock data mode (default: `"false"`)
- `NEXT_PUBLIC_SITE_TITLE` - Site title for branding

### Testing

- `BASE_URL` - E2E test base URL (default: `http://localhost:3000`)

## Key Dependencies

- **Next.js 15** with App Router and Turbopack
- **React 19** with React DOM 19
- **TailwindCSS 4** with lightningcss
- **shadcn/ui** - UI component library
- **React Query** - Server state management
- **Axios** - HTTP client
- **Orval** - API client code generation
- **next-intl** - Internationalization
- **Ably** - Real-time messaging
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Zod** - Schema validation
- **React Hook Form** - Form management

## Path Aliases

The project uses TypeScript path alias `@/*` which resolves to `src/*`:

```typescript
import { Component } from '@/components/Component'
import { useAuth } from '@/contexts/AuthContext'
```

## Turbopack

Both dev and build commands use `--turbopack` flag for faster builds and hot module replacement.

## Windows Development

The project includes Windows-specific optional dependencies:

- `@rollup/rollup-win32-x64-msvc`
- `@tailwindcss/oxide-win32-x64-msvc`
- `lightningcss-win32-x64-msvc`
