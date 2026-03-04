import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import DashboardPage from '@/features/dashboard/DashboardPage'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { useRecentAudit } from '@/features/dashboard/hooks/useRecentAudit'

vi.mock('@/hooks/usePermissions')
vi.mock('@/hooks/useFeatureGate')
vi.mock('@/features/dashboard/hooks/useDashboardStats')
vi.mock('@/features/dashboard/hooks/useRecentAudit')

const mockPermissions = {
  hasPermission: () => true,
  hasRole: () => false,
  isOwner: false,
  isAdmin: true,
  canManageBilling: true,
  canUpgradePlan: false,
  getPrimaryRole: () => 'OrgAdmin',
  getRoleColor: () => '#dc2626',
}

const mockFeatureGate = {
  hasFeature: () => true,
  getLimit: (key: string) => {
    const limits: Record<string, number | null> = { users: 50, storage_gb: 10, api_calls_per_month: 10000 }
    return limits[key] ?? null
  },
  plan: 'professional',
  isLoading: false,
}

const mockStats = {
  allUsers: [],
  activeUsers: 5,
  totalUsers: 5,
  totalRoles: 3,
  recentUsers: [],
  isLoading: false,
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <DashboardPage /> }], { initialEntries: ['/'] })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePermissions).mockReturnValue(mockPermissions)
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGate)
    vi.mocked(useDashboardStats).mockReturnValue(mockStats)
    vi.mocked(useRecentAudit).mockReturnValue({ logs: [], isLoading: false })
  })

  it('renders DashboardPage without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
