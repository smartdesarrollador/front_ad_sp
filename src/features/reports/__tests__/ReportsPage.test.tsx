import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReportsPage from '../ReportsPage'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useSummary } from '../hooks/useSummary'
import { useUsageReport } from '../hooks/useUsageReport'
import { useTrends } from '../hooks/useTrends'
import { useServiceAdoption } from '../hooks/useServiceAdoption'
import { useStorageReport } from '../hooks/useStorageReport'
import { useVistaTraffic } from '../hooks/useVistaTraffic'
import { useDesktopLicenseFunnel } from '../hooks/useDesktopLicenseFunnel'

vi.mock('@/hooks/useFeatureGate')
vi.mock('../hooks/useSummary')
vi.mock('../hooks/useUsageReport')
vi.mock('../hooks/useTrends')
vi.mock('../hooks/useServiceAdoption')
vi.mock('../hooks/useStorageReport')
vi.mock('../hooks/useVistaTraffic')
vi.mock('../hooks/useDesktopLicenseFunnel')

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

const mockAdoption = {
  services: [
    { service: 'workspace', name: 'Workspace', acquired: 10, activated: 7, activation_rate: 70.0 },
    { service: 'vista', name: 'Vista', acquired: 10, activated: 4, activation_rate: 40.0 },
    { service: 'desktop', name: 'Desktop App', acquired: 10, activated: 2, activation_rate: 20.0 },
  ],
}

const mockVistaTraffic = {
  period_days: 30,
  services: [
    { service: 'tarjeta', views: 120, unique_views: 80, shares: 5 },
    { service: 'landing', views: 40, unique_views: 30, shares: 1 },
    { service: 'portafolio', views: 0, unique_views: 0, shares: 0 },
    { service: 'cv', views: 15, unique_views: 12, shares: 0 },
  ],
  referrers: [
    { source: 'google.com', visits: 42 },
    { source: 'linkedin.com', visits: 18 },
  ],
}

// Numbers chosen to avoid colliding with mockSummary's exact-text assertions
// ('8', '5', '$29.00', 'de 100 totales') in other tests via getByText.
const mockDesktopFunnel = {
  total: 50,
  sent: 32,
  activated: 19,
  pending: 9,
  revoked: 4,
  activation_rate: 59.4,
}

const mockFeatureGateAll = {
  hasFeature: () => true,
  getLimit: () => null,
  plan: 'enterprise',
  isLoading: false,
}

const mockStorage = {
  total_used_gb: 7.4,
  tenant_count: 3,
  by_plan: [
    { plan: 'free', plan_name: 'Free', used_gb: 0.9, tenant_count: 1 },
    { plan: 'starter', plan_name: 'Starter', used_gb: 3.0, tenant_count: 1 },
    { plan: 'professional', plan_name: 'Professional', used_gb: 0, tenant_count: 0 },
    { plan: 'enterprise', plan_name: 'Enterprise', used_gb: 3.5, tenant_count: 1 },
  ],
  top_tenants: [
    { tenant: 'Acme Ent', plan: 'enterprise', used_gb: 3.5, limit_gb: null, pct: null },
    { tenant: 'Acme Starter', plan: 'starter', used_gb: 3.0, limit_gb: 5, pct: 60.0 },
    { tenant: 'Acme Free', plan: 'free', used_gb: 0.9, limit_gb: 1, pct: 90.0 },
  ],
  occupancy: [
    { bucket: '0-50%', tenant_count: 0 },
    { bucket: '50-80%', tenant_count: 1 },
    { bucket: '80-100%', tenant_count: 1 },
    { bucket: 'unlimited', tenant_count: 1 },
  ],
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
    vi.mocked(useServiceAdoption).mockReturnValue({ adoption: mockAdoption, isLoading: false })
    vi.mocked(useStorageReport).mockReturnValue({ storage: mockStorage, isLoading: false })
    vi.mocked(useVistaTraffic).mockReturnValue({ vistaTraffic: mockVistaTraffic, isLoading: false })
    vi.mocked(useDesktopLicenseFunnel).mockReturnValue({ desktopFunnel: mockDesktopFunnel, isLoading: false })
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

  it('renders the tenant storage section with the platform total', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    expect(screen.getByText('Almacenamiento de Tenants')).toBeInTheDocument()
    expect(screen.getByText('7.4 GB usados · 3 tenants')).toBeInTheDocument()
  })

  it('renders KPIs unconditionally and shows UpgradePrompt only for charts on free plan', () => {
    vi.mocked(useFeatureGate).mockReturnValue({
      ...mockFeatureGateAll,
      hasFeature: () => false,
    })
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })

    renderPage()

    // KPIs are cross-tenant platform metrics (staff-only), not gated by the
    // current tenant's plan — they must render even when hasFeature() is false.
    expect(screen.getByText('$29.00')).toBeInTheDocument()
    // Service adoption and Vista traffic are the same kind of staff-only
    // cross-tenant data — must render even when hasFeature() is false.
    expect(screen.getByText('Adopción de Servicios')).toBeInTheDocument()
    expect(screen.getByText('Tráfico de Vista')).toBeInTheDocument()
    expect(screen.getByText('Licencias Desktop')).toBeInTheDocument()
    // Charts/export section is still plan-gated.
    expect(screen.getByText(/actualizar plan/i)).toBeInTheDocument()
  })

  it('shows "Sin datos disponibles" when there is no service adoption data', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })
    vi.mocked(useServiceAdoption).mockReturnValue({ adoption: { services: [] }, isLoading: false })

    renderPage()

    expect(screen.getByText('Sin datos disponibles')).toBeInTheDocument()
  })

  it('shows "Sin datos disponibles" when there is no vista traffic data', () => {
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGateAll)
    vi.mocked(useSummary).mockReturnValue({ summary: mockSummary, isLoading: false })
    vi.mocked(useUsageReport).mockReturnValue({ usage: mockUsage, isLoading: false })
    // useServiceAdoption keeps its non-empty default so only the Vista Traffic
    // widgets (chart + referrer list) render the empty state — both use the
    // same "Sin datos disponibles" text, so expect two matches, not one.
    vi.mocked(useVistaTraffic).mockReturnValue({
      vistaTraffic: {
        period_days: 30,
        services: [
          { service: 'tarjeta', views: 0, unique_views: 0, shares: 0 },
          { service: 'landing', views: 0, unique_views: 0, shares: 0 },
          { service: 'portafolio', views: 0, unique_views: 0, shares: 0 },
          { service: 'cv', views: 0, unique_views: 0, shares: 0 },
        ],
        referrers: [],
      },
      isLoading: false,
    })

    renderPage()

    expect(screen.getAllByText('Sin datos disponibles').length).toBeGreaterThanOrEqual(2)
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
    vi.mocked(useServiceAdoption).mockReturnValue({ adoption: undefined, isLoading: true })
    vi.mocked(useVistaTraffic).mockReturnValue({ vistaTraffic: undefined, isLoading: true })
    vi.mocked(useDesktopLicenseFunnel).mockReturnValue({ desktopFunnel: undefined, isLoading: true })

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
