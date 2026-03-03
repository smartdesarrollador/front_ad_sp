import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReportsPage from '../ReportsPage'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useSummary } from '../hooks/useSummary'
import { useUsageReport } from '../hooks/useUsageReport'
import { useTrends } from '../hooks/useTrends'

vi.mock('@/hooks/useFeatureGate')
vi.mock('../hooks/useSummary')
vi.mock('../hooks/useUsageReport')
vi.mock('../hooks/useTrends')

const mockSummary = {
  total_users: 100,
  active_users: 8,
  new_users_this_month: 5,
  mrr: 29,
  arr: 348,
  avg_revenue_per_user: 3.625,
  churn_rate: 2.5,
  trial_conversions: 3,
}

const mockUsage = {
  role_distribution: [
    { role: 'Owner', count: 1, percentage: 12.5 },
    { role: 'Member', count: 7, percentage: 87.5 },
  ],
  top_permissions: [],
  monthly_growth: [],
}

const mockFeatureGateAll = {
  hasFeature: () => true,
  getLimit: () => null,
  plan: 'enterprise',
  isLoading: false,
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <ReportsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTrends).mockReturnValue({ trends: undefined, isLoading: false })
  })

  it('renders KPI cards with correct data', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    expect(screen.getByText('$29.00')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('de 100 totales')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows UpgradePrompt for the entire page on free plan (analytics feature off)', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      ...mockFeatureGateAll,
      hasFeature: () => false,
    })
    vi.mocked(useSummary).mockReturnValue({ summary: undefined, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: undefined, isLoading: false })

    renderPage()

    expect(screen.getByText(/actualizar plan/i)).toBeInTheDocument()
  })

  it('shows KPIs but UpgradePrompt for trends on starter plan', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      ...mockFeatureGateAll,
      hasFeature: (f: string) => f !== 'analytics_trends',
      plan: 'starter',
    })
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    // KPIs are visible
    expect(screen.getByText('$29.00')).toBeInTheDocument()
    // Trends section shows upgrade prompt
    expect(screen.getByText(/actualizar plan/i)).toBeInTheDocument()
  })

  it('shows skeleton while data is loading', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: undefined, isLoading: true })
    vi.mocked(useUsageReport).mockReturnValue({ usage: undefined, isLoading: true })

    const { container } = renderPage()

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows disabled Export button (not active export) on non-enterprise plan', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      ...mockFeatureGateAll,
      hasFeature: (f: string) => f !== 'analytics_export',
      plan: 'professional',
    })
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    const exportBtn = screen.getByRole('button', { name: /exportar csv/i })
    expect(exportBtn).toBeDisabled()
  })
})
