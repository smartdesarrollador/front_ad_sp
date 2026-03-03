import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PermissionsPage from '../PermissionsPage'
import { usePermissions } from '../hooks/usePermissions'

vi.mock('../hooks/usePermissions')

const mockPermissions = [
  { id: 'p1', codename: 'view_customuser', name: 'Ver usuarios', resource: 'auth_app', description: '' },
  { id: 'p2', codename: 'add_customuser', name: 'Crear usuarios', resource: 'auth_app', description: '' },
  { id: 'p3', codename: 'view_role', name: 'Ver roles', resource: 'rbac', description: '' },
  { id: 'p4', codename: 'add_role', name: 'Crear roles', resource: 'rbac', description: '' },
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <PermissionsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('PermissionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders grouped permissions by resource', () => {
    vi.mocked(usePermissions).mockReturnValue({ permissions: mockPermissions, isLoading: false })

    renderPage()

    // Group headers in Spanish (text appears multiple times: header + option + badges)
    expect(screen.getAllByText('Usuarios').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Roles y Permisos').length).toBeGreaterThan(0)

    // All 4 codenames present
    expect(screen.getByText('view_customuser')).toBeInTheDocument()
    expect(screen.getByText('add_customuser')).toBeInTheDocument()
    expect(screen.getByText('view_role')).toBeInTheDocument()
    expect(screen.getByText('add_role')).toBeInTheDocument()
  })

  it('search filter narrows visible permissions', async () => {
    vi.mocked(usePermissions).mockReturnValue({ permissions: mockPermissions, isLoading: false })

    const user = userEvent.setup()
    renderPage()

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o codename/i)
    // 'view_custom' matches 'view_customuser' but not 'add_customuser' or 'view_role'
    await user.type(searchInput, 'view_custom')

    // Only the matching permission is visible
    expect(screen.getByText('view_customuser')).toBeInTheDocument()
    expect(screen.queryByText('add_customuser')).not.toBeInTheDocument()
    expect(screen.queryByText('view_role')).not.toBeInTheDocument()
  })

  it('page is read-only (no write buttons present)', () => {
    vi.mocked(usePermissions).mockReturnValue({
      permissions: mockPermissions.slice(0, 2),
      isLoading: false,
    })

    renderPage()

    // No write action buttons
    expect(screen.queryByRole('button', { name: /crear/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /guardar/i })).not.toBeInTheDocument()

    // Only inputs are search + category select (no form inputs)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(1) // only search input
  })
})
