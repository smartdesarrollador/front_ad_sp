import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RolesPage from '../RolesPage'
import { useRoles } from '../hooks/useRoles'
import { useCreateRole } from '../hooks/useCreateRole'
import { useUpdateRole } from '../hooks/useUpdateRole'
import { useDeleteRole } from '../hooks/useDeleteRole'
import { usePermissionsList } from '../hooks/usePermissionsList'
import { usePermissions } from '@/hooks/usePermissions'

vi.mock('../hooks/useRoles')
vi.mock('../hooks/useCreateRole')
vi.mock('../hooks/useUpdateRole')
vi.mock('../hooks/useDeleteRole')
vi.mock('../hooks/usePermissionsList')
vi.mock('@/hooks/usePermissions')

const mockRoles = [
  {
    id: 'role-1',
    name: 'OrgAdmin',
    description: 'Administrator of the organization',
    is_system_role: true,
    user_count: 2,
    permissions: [{ id: 'p1', codename: 'users.read', name: 'View Users' }],
  },
  {
    id: 'role-2',
    name: 'Editor',
    description: 'Can edit content',
    is_system_role: false,
    user_count: 5,
    permissions: [{ id: 'p2', codename: 'content.edit', name: 'Edit Content' }],
  },
  {
    id: 'role-3',
    name: 'Reviewer',
    description: 'Can review content',
    is_system_role: false,
    user_count: 3,
    permissions: [],
  },
]

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

const baseMutationResult = {
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

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <RolesPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('RolesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useUpdateRole).mockReturnValue({ ...baseMutationResult } as ReturnType<typeof useUpdateRole>)
    vi.mocked(useDeleteRole).mockReturnValue({ ...baseMutationResult } as ReturnType<typeof useDeleteRole>)
    vi.mocked(usePermissionsList).mockReturnValue({ permissions: [], isLoading: false })
  })

  it('renders role cards with names', () => {
    vi.mocked(useRoles).mockReturnValue({ roles: mockRoles, isLoading: false })
    vi.mocked(useCreateRole).mockReturnValue({ ...baseMutationResult } as ReturnType<typeof useCreateRole>)

    renderPage()

    expect(screen.getByText('OrgAdmin')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Reviewer')).toBeInTheDocument()
  })

  it('system role does not show edit/delete buttons', () => {
    vi.mocked(useRoles).mockReturnValue({ roles: mockRoles, isLoading: false })
    vi.mocked(useCreateRole).mockReturnValue({ ...baseMutationResult } as ReturnType<typeof useCreateRole>)

    renderPage()

    // Custom roles should have edit buttons
    const editButtons = screen.getAllByTitle('Editar rol')
    expect(editButtons.length).toBe(2) // Editor + Reviewer

    // System role (OrgAdmin) should not have edit/delete buttons
    // We verify by checking there's no delete button for the system role card
    // The system role card should show the "Sistema" badge instead
    expect(screen.getByText('Sistema')).toBeInTheDocument()

    // Delete buttons only for custom roles
    const deleteButtons = screen.getAllByTitle('Eliminar rol')
    expect(deleteButtons.length).toBe(2) // Editor + Reviewer
  })

  it('create role modal opens and calls mutate', async () => {
    const mutateMock = vi.fn()
    vi.mocked(useRoles).mockReturnValue({ roles: [], isLoading: false })
    vi.mocked(useCreateRole).mockReturnValue({
      ...baseMutationResult,
      mutate: mutateMock,
    } as ReturnType<typeof useCreateRole>)

    const user = userEvent.setup()
    renderPage()

    // Open modal
    await user.click(screen.getByRole('button', { name: /nuevo rol/i }))

    // Modal visible
    expect(screen.getByPlaceholderText(/nombre del rol/i)).toBeInTheDocument()

    // Fill name
    await user.type(screen.getByPlaceholderText(/nombre del rol/i), 'Soporte')

    // Submit
    await user.click(screen.getByRole('button', { name: /crear rol/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Soporte' }),
        expect.any(Object),
      )
    })
  })

  it('delete shows inline confirmation then calls mutate', async () => {
    const mutateMock = vi.fn()
    vi.mocked(useRoles).mockReturnValue({
      roles: [mockRoles[1]], // Editor (custom)
      isLoading: false,
    })
    vi.mocked(useCreateRole).mockReturnValue({ ...baseMutationResult } as ReturnType<typeof useCreateRole>)
    vi.mocked(useDeleteRole).mockReturnValue({
      ...baseMutationResult,
      mutate: mutateMock,
    } as ReturnType<typeof useDeleteRole>)

    const user = userEvent.setup()
    renderPage()

    // Click delete button
    await user.click(screen.getByTitle('Eliminar rol'))

    // Confirmation appears
    expect(screen.getByText('¿Confirmar?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sí, eliminar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()

    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /sí, eliminar/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith('role-2')
    })
  })
})
