import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from '../DashboardPage'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useRecentAudit } from '../hooks/useRecentAudit'

vi.mock('@/hooks/usePermissions')
vi.mock('@/hooks/useFeatureGate')
vi.mock('../hooks/useDashboardStats')
vi.mock('../hooks/useRecentAudit')

const mockPermissionsAdmin = {
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
    const limits: Record<string, number | null> = {
      users: 50,
      storage_gb: 10,
      api_calls_per_month: 10000,
    }
    return limits[key] ?? null
  },
  plan: 'professional',
  isLoading: false,
}

const mockUsers = [
  {
    id: '1',
    email: 'alice@acme.com',
    name: 'Alice Smith',
    is_active: true,
    email_verified: true,
    roles: ['OrgAdmin'],
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: '2',
    email: 'bob@acme.com',
    name: 'Bob Jones',
    is_active: false,
    email_verified: true,
    roles: ['Member'],
    created_at: '2026-01-04T10:00:00Z',
  },
  {
    id: '3',
    email: 'carol@acme.com',
    name: 'Carol White',
    is_active: true,
    email_verified: false,
    roles: ['Viewer'],
    created_at: '2026-01-03T10:00:00Z',
  },
  {
    id: '4',
    email: 'dave@acme.com',
    name: 'Dave Brown',
    is_active: true,
    email_verified: true,
    roles: ['Member'],
    created_at: '2026-01-02T10:00:00Z',
  },
  {
    id: '5',
    email: 'eve@acme.com',
    name: 'Eve Green',
    is_active: true,
    email_verified: true,
    roles: ['Member'],
    created_at: '2026-01-01T10:00:00Z',
  },
]

const mockStatsLoaded = {
  allUsers: mockUsers,
  activeUsers: 4,
  totalUsers: 5,
  totalRoles: 3,
  recentUsers: mockUsers,
  isLoading: false,
}

const mockAuditLoaded = {
  logs: [],
  isLoading: false,
}

function renderDashboard() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [{ path: '/', element: <DashboardPage /> }],
    { initialEntries: ['/'] },
  )
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useFeatureGate).mockReturnValue(mockFeatureGate)
    vi.mocked(useRecentAudit).mockReturnValue(mockAuditLoaded)
  })

  it('renders 4 stats cards when user is admin', () => {
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useDashboardStats).mockReturnValue({
      ...mockStatsLoaded,
      activeUsers: 10,
      totalRoles: 3,
    })

    renderDashboard()

    expect(screen.getByText('Usuarios Activos')).toBeInTheDocument()
    expect(screen.getByText('Roles Configurados')).toBeInTheDocument()
    expect(screen.getByText('Almacenamiento')).toBeInTheDocument()
    expect(screen.getByText('API Calls / Mes')).toBeInTheDocument()
  })

  it('shows recent users table with 5 rows', () => {
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useDashboardStats).mockReturnValue(mockStatsLoaded)

    renderDashboard()

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Carol White')).toBeInTheDocument()
    expect(screen.getByText('Dave Brown')).toBeInTheDocument()
    expect(screen.getByText('Eve Green')).toBeInTheDocument()
  })

  it('shows skeleton cards when loading and no stat headings', () => {
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useDashboardStats).mockReturnValue({
      allUsers: [],
      activeUsers: 0,
      totalUsers: 0,
      totalRoles: 0,
      recentUsers: [],
      isLoading: true,
    })

    const { container } = renderDashboard()

    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBeGreaterThan(0)

    expect(screen.queryByText('Usuarios Activos')).not.toBeInTheDocument()
    expect(screen.queryByText('Roles Configurados')).not.toBeInTheDocument()
  })
})
