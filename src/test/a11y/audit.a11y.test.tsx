import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import AuditPage from '@/features/audit/AuditPage'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useAuditLogs } from '@/features/audit/hooks/useAuditLogs'

globalThis.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  constructor(_cb: unknown, _opts?: unknown) {}
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: number[] = []
  takeRecords(): IntersectionObserverEntry[] { return [] }
}

vi.mock('@/hooks/useFeatureGate')
vi.mock('@/features/audit/hooks/useAuditLogs')

const mockFeatureGate = {
  hasFeature: () => true,
  getLimit: () => null,
  plan: 'enterprise',
  isLoading: false,
}

const mockAuditLogs = {
  logs: [
    { id: 'log-1', action: 'create', resource_type: 'user', resource_id: 'abc123', user_email: 'alice@example.com', user_name: 'Alice Smith', ip_address: '192.168.1.1', created_at: '2026-03-03T10:00:00Z' },
  ],
  data: { pages: [{ logs: [], pagination: { page: 1, per_page: 25, total: 1, total_pages: 1 } }], pageParams: [1] },
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <AuditPage /> }], { initialEntries: ['/'] })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGate)
    vi.mocked(useAuditLogs).mockReturnValue(mockAuditLogs)
  })

  it('renders AuditPage without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
