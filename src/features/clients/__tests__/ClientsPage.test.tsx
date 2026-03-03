import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ClientsPage from '../ClientsPage'
import { useClients } from '../hooks/useClients'
import { useSuspendClient } from '../hooks/useSuspendClient'
import { usePermissions } from '@/hooks/usePermissions'

vi.mock('../hooks/useClients')
vi.mock('../hooks/useSuspendClient')
vi.mock('@/hooks/usePermissions')

const mockUsage = {
  users: { current: 5, limit: 10 },
  storage: { current_gb: 1, limit_gb: 5 },
  api_calls: { current: 100, limit: 1000 },
}

const mockClients = [
  {
    id: 'c1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    subdomain: 'acme.app',
    admin_email: 'admin@acme.com',
    is_active: true,
    primary_color: '#e63946',
    subscription: { status: 'active' as const, plan: 'free' as const, plan_name: 'Free', mrr: 0, trial_ends_at: null },
    usage: mockUsage,
    recent_users: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    name: 'Beta Ltd',
    slug: 'beta-ltd',
    subdomain: 'beta.app',
    admin_email: 'admin@beta.com',
    is_active: true,
    primary_color: null,
    subscription: { status: 'trial' as const, plan: 'starter' as const, plan_name: 'Starter', mrr: 49, trial_ends_at: null },
    usage: mockUsage,
    recent_users: [],
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 'c3',
    name: 'Gamma SA',
    slug: 'gamma-sa',
    subdomain: 'gamma.app',
    admin_email: 'admin@gamma.com',
    is_active: false,
    primary_color: null,
    subscription: { status: 'past_due' as const, plan: 'professional' as const, plan_name: 'Professional', mrr: 99, trial_ends_at: null },
    usage: mockUsage,
    recent_users: [],
    created_at: '2026-01-03T00:00:00Z',
  },
  {
    id: 'c4',
    name: 'Delta Inc',
    slug: 'delta-inc',
    subdomain: 'delta.app',
    admin_email: 'admin@delta.com',
    is_active: true,
    primary_color: null,
    subscription: { status: 'active' as const, plan: 'enterprise' as const, plan_name: 'Enterprise', mrr: 299, trial_ends_at: null },
    usage: mockUsage,
    recent_users: [],
    created_at: '2026-01-04T00:00:00Z',
  },
]

const mockPermissionsAdmin = {
  hasPermission: () => true,
  hasRole: () => false,
  isOwner: false,
  isAdmin: true,
  canManageBilling: true,
  canUpgradePlan: false,
  getPrimaryRole: () => 'SuperAdmin',
  getRoleColor: () => '#2563eb',
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <ClientsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSuspendClient).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
      status: 'idle',
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isPaused: false,
      submittedAt: 0,
    } as ReturnType<typeof useSuspendClient>)
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
  })

  it('renderiza tabla con plan badges correctos', () => {
    vi.mocked(useClients).mockReturnValue({ clients: mockClients, isLoading: false })

    renderPage()

    expect(screen.getAllByText('Free').length > 0).toBe(true)
    expect(screen.getAllByText('Starter').length > 0).toBe(true)
    expect(screen.getAllByText('Professional').length > 0).toBe(true)
    expect(screen.getAllByText('Enterprise').length > 0).toBe(true)
  })

  it('búsqueda filtra por subdominio', async () => {
    vi.mocked(useClients).mockReturnValue({ clients: mockClients, isLoading: false })

    const user = userEvent.setup()
    renderPage()

    const searchInput = screen.getByPlaceholderText(/buscar por empresa, email o subdominio/i)
    await user.type(searchInput, 'acme')

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.queryByText('Beta Ltd')).not.toBeInTheDocument()
    expect(screen.queryByText('Gamma SA')).not.toBeInTheDocument()
    expect(screen.queryByText('Delta Inc')).not.toBeInTheDocument()
  })

  it('suspender muestra modal de confirmación y cancelar lo cierra', async () => {
    vi.mocked(useClients).mockReturnValue({ clients: mockClients, isLoading: false })

    const user = userEvent.setup()
    renderPage()

    // Click Suspender en la primera fila activa
    const suspendButtons = screen.getAllByTitle('Suspender')
    await user.click(suspendButtons[0])

    // Modal debe aparecer
    expect(screen.getByText(/suspender cliente/i)).toBeInTheDocument()

    // Cancelar cierra el modal
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.queryByText(/suspender cliente/i)).not.toBeInTheDocument()
  })

  it('sin permiso clients.update oculta botones de acción', () => {
    vi.mocked(useClients).mockReturnValue({ clients: mockClients, isLoading: false })
    vi.mocked(usePermissions).mockReturnValue({
      ...mockPermissionsAdmin,
      hasPermission: () => false,
    })

    renderPage()

    expect(screen.queryByTitle('Suspender')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Activar')).not.toBeInTheDocument()
  })
})
