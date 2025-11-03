import { render, screen } from '@testing-library/react'
import { ReportsTable } from './reports-table'
import { vi } from 'vitest'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

interface Report {
  id: string
  report_type: string
  status: string
  start_date?: string
  end_date?: string
  created_at: string
  completed_at?: string
  download_url?: string
  error_message?: string
}

interface PaginatedReportsResponse {
  items: Report[]
  total: number
  page: number
  size: number
  has_next: boolean
  has_previous: boolean
}

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    isError: false
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false
  }))
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock fetch
global.fetch = vi.fn()

describe('ReportsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false
    } as unknown as UseQueryResult<PaginatedReportsResponse>)

    render(<ReportsTable />)

    expect(screen.getByTestId('reports-loading')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true
    } as unknown as UseQueryResult<PaginatedReportsResponse>)

    render(<ReportsTable />)

    expect(screen.getByTestId('reports-error')).toBeInTheDocument()
  })

  it('renders no data message', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false
    } as unknown as UseQueryResult<PaginatedReportsResponse>)

    render(<ReportsTable />)

    expect(screen.getByTestId('reports-no-data')).toBeInTheDocument()
  })

  it('renders table with data', () => {
    const mockData = {
      items: [
        {
          id: '1',
          report_type: 'orders_per_seller',
          status: 'completed',
          start_date: '2023-01-01',
          end_date: '2023-01-31',
          created_at: '2023-01-01T00:00:00Z',
          download_url: 'http://example.com/download'
        }
      ],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    vi.mocked(useQuery).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false
    } as unknown as UseQueryResult<PaginatedReportsResponse>)

    render(<ReportsTable />)

    expect(screen.getByTestId('reports-table')).toBeInTheDocument()
    expect(screen.getByTestId('report-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('report-id-1')).toHaveTextContent('1')
  })

  it('disables download button for non-completed reports', () => {
    const mockData = {
      items: [
        {
          id: '2',
          report_type: 'low_stock',
          status: 'pending',
          start_date: '2023-01-01',
          end_date: '2023-01-31',
          created_at: '2023-01-01T00:00:00Z'
        }
      ],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    vi.mocked(useQuery).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false
    } as unknown as UseQueryResult<PaginatedReportsResponse>)

    render(<ReportsTable />)

    const downloadButton = screen.getByTestId('download-button-2')
    expect(downloadButton).toBeDisabled()
  })

  // Edge case: empty data array
  it('handles empty data array', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: { items: null },
      isLoading: false,
      isError: false
    } as unknown as UseQueryResult<PaginatedReportsResponse>)

    render(<ReportsTable />)

    expect(screen.getByTestId('reports-no-data')).toBeInTheDocument()
  })

  // Edge case: missing dates
  it('handles reports without dates', () => {
    const mockData = {
      items: [
        {
          id: '3',
          report_type: 'orders_per_status',
          status: 'completed',
          created_at: '2023-01-01T00:00:00Z'
        }
      ],
      total: 1,
      page: 1,
      size: 10,
      has_next: false,
      has_previous: false
    }

    vi.mocked(useQuery).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false
    } as unknown as UseQueryResult<PaginatedReportsResponse>)

    render(<ReportsTable />)

    expect(screen.getByTestId('report-dates-3')).toHaveTextContent('-')
  })
})
