import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import UsersPage from '@/features/users/UsersPage'
import { usePermissions } from '@/hooks/usePermissions'
import { useUsers } from '@/features/users/hooks/useUsers'
import { useInviteUser } from '@/features/users/hooks/useInviteUser'
import { useRolesForSelect } from '@/features/users/hooks/useRolesForSelect'
import { useSuspendUser } from '@/features/users/hooks/useSuspendUser'

vi.mock('@/hooks/usePermissions')
vi.mock('@/features/users/hooks/useUsers')
vi.mock('@/features/users/hooks/useInviteUser')
vi.mock('@/features/users/hooks/useRolesForSelect')
vi.mock('@/features/users/hooks/useSuspendUser')

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

const mockMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  reset: vi.fn(),
  status: 'idle' as const,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isIdle: true,
  isPaused: false,
  submittedAt: 0,
}

const mockUsers = [
  { id: '1', name: 'Alice Smith', email: 'alice@acme.com', is_active: true, email_verified: true, roles: ['OrgAdmin'], created_at: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'Bob Jones', email: 'bob@acme.com', is_active: false, email_verified: true, roles: ['Member'], created_at: '2026-01-02T00:00:00Z' },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <UsersPage /> }], { initialEntries: ['/'] })
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
    vi.mocked(useUsers).mockReturnValue({ users: mockUsers, isLoading: false })
    vi.mocked(useInviteUser).mockReturnValue(mockMutation as unknown as ReturnType<typeof useInviteUser>)
    vi.mocked(useRolesForSelect).mockReturnValue({ roles: [], isLoading: false })
    vi.mocked(useSuspendUser).mockReturnValue(mockMutation as unknown as ReturnType<typeof useSuspendUser>)
  })

  it('renders UsersPage without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
