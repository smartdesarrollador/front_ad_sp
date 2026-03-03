import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuditPage from '../AuditPage'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useAuditLogs } from '../hooks/useAuditLogs'

globalThis.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  constructor(_cb: unknown, _opts?: unknown) {}
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: number[] = []
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

vi.mock('@/hooks/useFeatureGate')
vi.mock('../hooks/useAuditLogs')

const mockLog1 = {
  id: 'log-1',
  action: 'create',
  resource_type: 'user',
  resource_id: 'abc123def456',
  user_email: 'alice@example.com',
  user_name: 'Alice Smith',
  ip_address: '192.168.1.1',
  created_at: '2026-03-03T10:00:00Z',
}

const mockLog2 = {
  id: 'log-2',
  action: 'delete',
  resource_type: 'role',
  resource_id: null,
  user_email: null,
  user_name: null,
  ip_address: '10.0.0.1',
  created_at: '2026-03-03T11:00:00Z',
}

const mockFeatureGateAll = {
  hasFeature: () => true,
  getLimit: () => null,
  plan: 'enterprise',
  isLoading: false,
}

const mockAuditLogsDefault = {
  logs: [],
  data: undefined,
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <AuditPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('AuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useAuditLogs).mockReturnValue(mockAuditLogsDefault)
  })

  it('renders rows with actor and action', () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      ...mockAuditLogsDefault,
      logs: [mockLog1, mockLog2],
      data: {
        pages: [{ logs: [mockLog1, mockLog2], pagination: { page: 1, per_page: 25, total: 2, total_pages: 1 } }],
        pageParams: [1],
      },
    })

    renderPage()

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Sistema')).toBeInTheDocument()
    expect(screen.getByText('create')).toBeInTheDocument()
    expect(screen.getByText('delete')).toBeInTheDocument()
  })

  it('shows UpgradePrompt on free plan (audit_logs feature off)', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      ...mockFeatureGateAll,
      hasFeature: () => false,
    })

    renderPage()

    expect(screen.getByText(/actualizar plan/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('re-invokes hook when action filter changes', async () => {
    const user = userEvent.setup()

    renderPage()

    const select = screen.getByRole('combobox', { name: /acción/i })
    await user.selectOptions(select, 'create')

    expect(useAuditLogs).toHaveBeenCalledWith(expect.objectContaining({ action: 'create' }))
  })

  it('shows spinner while isFetchingNextPage is true', () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      ...mockAuditLogsDefault,
      logs: [mockLog1],
      isFetchingNextPage: true,
      hasNextPage: true,
      data: {
        pages: [{ logs: [mockLog1], pagination: { page: 1, per_page: 25, total: 1, total_pages: 2 } }],
        pageParams: [1],
      },
    })

    renderPage()

    expect(screen.getByText('Cargando más...')).toBeInTheDocument()
  })
})
