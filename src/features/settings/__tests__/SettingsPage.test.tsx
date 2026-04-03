import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SettingsPage from '../SettingsPage'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { useChangePassword } from '../hooks/useChangePassword'
import { useMFASetup } from '../hooks/useMFASetup'
import { useMFADisable } from '../hooks/useMFADisable'
import { useUpdateOrganization } from '../hooks/useUpdateOrganization'

vi.mock('@/hooks/usePermissions')
vi.mock('@/store/authStore')
vi.mock('../hooks/useUpdateProfile')
vi.mock('../hooks/useChangePassword')
vi.mock('../hooks/useMFASetup')
vi.mock('../hooks/useMFADisable')
vi.mock('../hooks/useUpdateOrganization')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: 'es', changeLanguage: vi.fn() },
  }),
}))
vi.mock('@/store/uiStore', () => ({
  useUiStore: (selector: (s: { darkMode: boolean; toggleDarkMode: () => void }) => unknown) =>
    selector({ darkMode: false, toggleDarkMode: vi.fn() }),
}))

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

const mockUser = {
  id: 'u1',
  email: 'admin@acme.com',
  firstName: 'Admin',
  lastName: 'User',
  name: 'Admin User',
  roles: ['Owner'],
  permissions: [],
  status: 'active' as const,
  mfaEnabled: false,
  is_staff: true,
  tenantId: 't1',
  lastLogin: null,
  createdAt: '2026-01-01T00:00:00Z',
}

const mockTenant = {
  id: 't1',
  name: 'Acme Corp',
  subdomain: 'acme',
  plan: 'professional',
}

const mockAuthState = {
  user: mockUser,
  tenant: mockTenant,
  accessToken: 'token',
  isAuthenticated: true,
  setUser: vi.fn(),
  setTenant: vi.fn(),
  setAccessToken: vi.fn(),
  clearAuth: vi.fn(),
}

const mockPermissionsAdmin = {
  hasPermission: () => true,
  hasRole: () => false,
  isOwner: true,
  isAdmin: true,
  canManageBilling: true,
  canUpgradePlan: false,
  getPrimaryRole: () => 'Owner',
  getRoleColor: () => '#dc2626',
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <SettingsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockImplementation(
      (selector?: (s: typeof mockAuthState) => unknown) =>
        typeof selector === 'function' ? selector(mockAuthState) : mockAuthState,
    )
    vi.mocked(useUpdateProfile).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useUpdateProfile>,
    )
    vi.mocked(useChangePassword).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useChangePassword>,
    )
    vi.mocked(useMFASetup).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useMFASetup>,
    )
    vi.mocked(useMFADisable).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useMFADisable>,
    )
    vi.mocked(useUpdateOrganization).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useUpdateOrganization>,
    )
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
  })

  it('tab organización oculto para usuarios sin permiso', () => {
    vi.mocked(usePermissions).mockReturnValue({ ...mockPermissionsAdmin, isAdmin: false })

    renderPage()

    expect(screen.queryByRole('button', { name: /organización/i })).not.toBeInTheDocument()
  })

  it('cambio contraseña valida confirmación', async () => {
    vi.mocked(usePermissions).mockReturnValue({ ...mockPermissionsAdmin, isAdmin: false })

    renderPage()

    // Navegar a tab Seguridad
    fireEvent.click(screen.getByRole('button', { name: /seguridad/i }))

    // Llenar contraseñas que no coinciden
    fireEvent.change(screen.getByLabelText(/contraseña actual/i), {
      target: { value: 'old123' },
    })
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newPass1!' },
    })
    fireEvent.change(screen.getByLabelText(/confirmar/i), {
      target: { value: 'DIFERENTE' },
    })
    fireEvent.submit(screen.getByTestId('change-password-form'))

    // Debe mostrar error de validación
    expect(await screen.findByText(/contraseñas no coinciden/i)).toBeInTheDocument()
  })

  it('MFA muestra QR al habilitar', () => {
    vi.mocked(useMFASetup).mockReturnValue({
      ...mockMutation,
      mutate: vi.fn().mockImplementation(
        (_data: undefined, opts?: { onSuccess?: (data: { qr_uri: string; secret: string }) => void }) => {
          opts?.onSuccess?.({ qr_uri: 'otpauth://totp/test', secret: 'ABCDEF' })
        },
      ),
    } as unknown as ReturnType<typeof useMFASetup>)
    vi.mocked(usePermissions).mockReturnValue({ ...mockPermissionsAdmin, isAdmin: false })

    renderPage()

    // Ir a tab Seguridad
    fireEvent.click(screen.getByRole('button', { name: /seguridad/i }))

    // Click habilitar MFA
    fireEvent.click(screen.getByRole('button', { name: /habilitar mfa/i }))

    // QR debe estar visible
    expect(screen.getByAltText('MFA QR Code')).toBeInTheDocument()
  })
})
