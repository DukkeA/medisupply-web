import React, {
  PropsWithChildren,
  AnchorHTMLAttributes,
  HTMLAttributes
} from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DynamicBreadcrumb } from './dynamic-breadcrumb'

// Mock next/navigation
const mockUsePathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
}))

/* ✅ Mock next/link tipado */
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children
  }: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) => (
    <a href={typeof href === 'string' ? href : '#'}>{children}</a>
  )
}))

/* ✅ Mock de UI breadcrumb tipado (sin any) */
// Nota: si tu alias "@/components/..." no está configurado, cambia a ruta relativa correspondiente.
vi.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ children }: PropsWithChildren) => (
    <nav aria-label="breadcrumb">{children}</nav>
  ),
  BreadcrumbList: ({ children }: PropsWithChildren) => <ol>{children}</ol>,
  BreadcrumbItem: ({
    children,
    ...props
  }: PropsWithChildren<HTMLAttributes<HTMLLIElement>>) => (
    <li {...props}>{children}</li>
  ),
  BreadcrumbLink: ({ children }: PropsWithChildren) => <span>{children}</span>,
  BreadcrumbPage: ({ children }: PropsWithChildren) => <span>{children}</span>,
  BreadcrumbSeparator: ({ ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>/</span>
  )
}))

/* ✅ Helpers tipados */
vi.mock('@/lib/route-config', () => ({
  getRouteLabel: (p: string) => {
    const seg = p.split('/').filter(Boolean).pop() ?? 'Home'
    return seg.charAt(0).toUpperCase() + seg.slice(1)
  },
  shouldShowInBreadcrumb: () => true
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DynamicBreadcrumb', () => {
  it('should render nothing when on root path', () => {
    mockUsePathname.mockReturnValue('/')
    const { container } = render(<DynamicBreadcrumb />)
    expect(container.firstChild).toBeNull()
  })

  it('should render breadcrumb with separators for nested paths', () => {
    mockUsePathname.mockReturnValue('/products/123/details')
    render(<DynamicBreadcrumb />)

    expect(
      screen.getByRole('navigation', { name: /breadcrumb/i })
    ).toBeInTheDocument()

    // "Home" + tres segmentos (Products / 123 / Details)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()

    const seps = screen.getAllByText('/', { exact: true })
    expect(seps.length).toBeGreaterThanOrEqual(2)
  })
})
