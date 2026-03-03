import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SubscriptionPage from '../SubscriptionPage'
import { usePermissions } from '@/hooks/usePermissions'
import { useCurrentSubscription } from '../hooks/useCurrentSubscription'
import { useInvoices } from '../hooks/useInvoices'
import { useUpgradeSubscription } from '../hooks/useUpgradeSubscription'

vi.mock('@/hooks/usePermissions')
vi.mock('../hooks/useCurrentSubscription')
vi.mock('../hooks/useInvoices')
vi.mock('../hooks/useUpgradeSubscription')

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

const mockSubscriptionProfessional = {
  id: 'sub-1',
  plan: 'professional' as const,
  status: 'active' as const,
  billing_cycle: 'monthly' as const,
  cancel_at_period_end: false,
  trial_end: null,
  current_period_end: '2026-04-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  usage: {
    users: { current: 8, limit: 10 },
    storage: { current_gb: 3, limit_gb: 5 },
    api_calls: { current: 5000, limit: 10000 },
  },
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <SubscriptionPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SubscriptionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpgradeSubscription).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpgradeSubscription>)
    vi.mocked(useInvoices).mockReturnValue({ invoices: [], isLoading: false })
  })

  it('renders current plan card with plan name and status', () => {
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useCurrentSubscription).mockReturnValue({
      subscription: mockSubscriptionProfessional,
      isLoading: false,
    })

    renderPage()

    expect(screen.getAllByText('Plan Profesional').length).toBeGreaterThan(0)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('usage meters display correct values', () => {
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useCurrentSubscription).mockReturnValue({
      subscription: mockSubscriptionProfessional,
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText('8 / 10')).toBeInTheDocument()
    const meters = screen.getAllByRole('progressbar')
    expect(meters.length).toBeGreaterThan(0)
  })

  it('upgrade buttons disabled when user cannot manage billing', () => {
    vi.mocked(usePermissions).mockReturnValue({
      ...mockPermissionsAdmin,
      canManageBilling: false,
      canUpgradePlan: false,
    })
    vi.mocked(useCurrentSubscription).mockReturnValue({
      subscription: { ...mockSubscriptionProfessional, plan: 'free' },
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText('Acceso limitado')).toBeInTheDocument()
    const upgradeButtons = screen.queryAllByRole('button', { name: /actualizar plan/i })
    upgradeButtons.forEach((btn) => expect(btn).toBeDisabled())
  })
})
