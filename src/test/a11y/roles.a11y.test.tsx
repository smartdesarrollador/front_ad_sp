import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import RolesPage from '@/features/roles/RolesPage'
import { usePermissions } from '@/hooks/usePermissions'
import { useRoles } from '@/features/roles/hooks/useRoles'
import { useCreateRole } from '@/features/roles/hooks/useCreateRole'
import { useUpdateRole } from '@/features/roles/hooks/useUpdateRole'
import { useDeleteRole } from '@/features/roles/hooks/useDeleteRole'
import { usePermissionsList } from '@/features/roles/hooks/usePermissionsList'

vi.mock('@/hooks/usePermissions')
vi.mock('@/features/roles/hooks/useRoles')
vi.mock('@/features/roles/hooks/useCreateRole')
vi.mock('@/features/roles/hooks/useUpdateRole')
vi.mock('@/features/roles/hooks/useDeleteRole')
vi.mock('@/features/roles/hooks/usePermissionsList')

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

const mockRoles = [
  { id: 'role-1', name: 'OrgAdmin', description: 'Admin role', is_system_role: true, user_count: 2, permissions: [] },
  { id: 'role-2', name: 'Editor', description: 'Editor role', is_system_role: false, user_count: 5, permissions: [] },
]

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <RolesPage /> }], { initialEntries: ['/'] })
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
    vi.mocked(useRoles).mockReturnValue({ roles: mockRoles, isLoading: false })
    vi.mocked(useCreateRole).mockReturnValue(mockMutation as unknown as ReturnType<typeof useCreateRole>)
    vi.mocked(useUpdateRole).mockReturnValue(mockMutation as unknown as ReturnType<typeof useUpdateRole>)
    vi.mocked(useDeleteRole).mockReturnValue(mockMutation as unknown as ReturnType<typeof useDeleteRole>)
    vi.mocked(usePermissionsList).mockReturnValue({ permissions: [], isLoading: false })
  })

  it('renders RolesPage without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
