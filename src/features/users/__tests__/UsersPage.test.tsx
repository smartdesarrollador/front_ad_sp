import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UsersPage from '../UsersPage'
import { useUsers } from '../hooks/useUsers'
import { useInviteUser } from '../hooks/useInviteUser'
import { useRolesForSelect } from '../hooks/useRolesForSelect'
import { usePermissions } from '@/hooks/usePermissions'
import { useSuspendUser } from '../hooks/useSuspendUser'

vi.mock('../hooks/useUsers')
vi.mock('../hooks/useInviteUser')
vi.mock('../hooks/useRolesForSelect')
vi.mock('../hooks/useSuspendUser')
vi.mock('@/hooks/usePermissions')

const mockUsers = [
  {
    id: '1',
    name: 'Alice Smith',
    email: 'alice@acme.com',
    is_active: true,
    email_verified: true,
    roles: ['OrgAdmin'],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Bob Jones',
    email: 'bob@acme.com',
    is_active: false,
    email_verified: true,
    roles: ['Member'],
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@acme.com',
    is_active: true,
    email_verified: false,
    roles: ['Viewer'],
    created_at: '2026-01-03T00:00:00Z',
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

const mockPermissionsNoEdit = {
  ...mockPermissionsAdmin,
  hasPermission: (perm: string) => perm !== 'users.update' && perm !== 'users.invite',
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <UsersPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRolesForSelect).mockReturnValue({ roles: [], isLoading: false })
    vi.mocked(useSuspendUser).mockReturnValue({
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
    } as ReturnType<typeof useSuspendUser>)
  })

  it('renders user rows with names and status badges', () => {
    vi.mocked(useUsers).mockReturnValue({ users: mockUsers, isLoading: false })
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useInviteUser).mockReturnValue({
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
    } as ReturnType<typeof useInviteUser>)

    renderPage()

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Carol White')).toBeInTheDocument()

    // active badge
    expect(screen.getByText('Activo')).toBeInTheDocument()
    // inactive badge
    expect(screen.getByText('Inactivo')).toBeInTheDocument()
    // pending badge
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('search filter narrows displayed rows', async () => {
    const fiveUsers = [
      ...mockUsers,
      {
        id: '4',
        name: 'Dave Brown',
        email: 'dave@acme.com',
        is_active: true,
        email_verified: true,
        roles: [],
        created_at: '2026-01-04T00:00:00Z',
      },
      {
        id: '5',
        name: 'Eve Green',
        email: 'eve@acme.com',
        is_active: true,
        email_verified: true,
        roles: [],
        created_at: '2026-01-05T00:00:00Z',
      },
    ]

    vi.mocked(useUsers).mockReturnValue({ users: fiveUsers, isLoading: false })
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useInviteUser).mockReturnValue({
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
    } as ReturnType<typeof useInviteUser>)

    const user = userEvent.setup()
    renderPage()

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o email/i)
    await user.type(searchInput, 'alice')

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
    expect(screen.queryByText('Dave Brown')).not.toBeInTheDocument()
  })

  it('invite modal opens and calls mutate', async () => {
    const mutateMock = vi.fn()

    vi.mocked(useUsers).mockReturnValue({ users: mockUsers, isLoading: false })
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(useInviteUser).mockReturnValue({
      mutate: mutateMock,
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
    } as ReturnType<typeof useInviteUser>)

    const user = userEvent.setup()
    renderPage()

    // Open modal
    await user.click(screen.getByRole('button', { name: /invitar usuario/i }))
    // Modal is visible when the email placeholder appears inside the dialog
    expect(screen.getByPlaceholderText(/usuario@empresa\.com/i)).toBeInTheDocument()

    // Fill email
    await user.type(screen.getByPlaceholderText(/usuario@empresa\.com/i), 'newuser@test.com')

    // Submit
    await user.click(screen.getByRole('button', { name: /enviar invitación/i }))

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newuser@test.com' }),
        expect.any(Object),
      )
    })
  })

  it('suspend and edit buttons hidden without users.update permission', () => {
    vi.mocked(useUsers).mockReturnValue({ users: mockUsers, isLoading: false })
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsNoEdit)
    vi.mocked(useInviteUser).mockReturnValue({
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
    } as ReturnType<typeof useInviteUser>)

    renderPage()

    expect(screen.queryByTitle('Editar')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Suspender')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Activar')).not.toBeInTheDocument()
    // Invite button should also be hidden
    expect(screen.queryByRole('button', { name: /invitar usuario/i })).not.toBeInTheDocument()
  })
})
