import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'jest-axe'
import { axeConfig } from '../setup'
import SettingsPage from '@/features/settings/SettingsPage'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile } from '@/features/settings/hooks/useUpdateProfile'
import { useChangePassword } from '@/features/settings/hooks/useChangePassword'
import { useMFASetup } from '@/features/settings/hooks/useMFASetup'
import { useMFADisable } from '@/features/settings/hooks/useMFADisable'
import { useUpdateOrganization } from '@/features/settings/hooks/useUpdateOrganization'

vi.mock('@/hooks/usePermissions')
vi.mock('@/store/authStore')
vi.mock('@/features/settings/hooks/useUpdateProfile')
vi.mock('@/features/settings/hooks/useChangePassword')
vi.mock('@/features/settings/hooks/useMFASetup')
vi.mock('@/features/settings/hooks/useMFADisable')
vi.mock('@/features/settings/hooks/useUpdateOrganization')
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
  id: 'u1', email: 'admin@acme.com', firstName: 'Admin', lastName: 'User', name: 'Admin User',
  roles: ['Owner'], permissions: [], status: 'active' as const, mfaEnabled: false,
  tenantId: 't1', lastLogin: null, createdAt: '2026-01-01T00:00:00Z',
}

const mockTenant = { id: 't1', name: 'Acme Corp', subdomain: 'acme', plan: 'professional' }

const mockAuthState = {
  user: mockUser, tenant: mockTenant, accessToken: 'token', isAuthenticated: true,
  setUser: vi.fn(), setTenant: vi.fn(), setAccessToken: vi.fn(), clearAuth: vi.fn(),
}

const mockPermissions = {
  hasPermission: () => true, hasRole: () => false, isOwner: true, isAdmin: true,
  canManageBilling: true, canUpgradePlan: false, getPrimaryRole: () => 'Owner', getRoleColor: () => '#dc2626',
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <SettingsPage /> }], { initialEntries: ['/'] })
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
    vi.mocked(useAuthStore).mockImplementation(
      (selector?: (s: typeof mockAuthState) => unknown) =>
        typeof selector === 'function' ? selector(mockAuthState) : mockAuthState,
    )
    vi.mocked(useUpdateProfile).mockReturnValue(mockMutation as unknown as ReturnType<typeof useUpdateProfile>)
    vi.mocked(useChangePassword).mockReturnValue(mockMutation as unknown as ReturnType<typeof useChangePassword>)
    vi.mocked(useMFASetup).mockReturnValue(mockMutation as unknown as ReturnType<typeof useMFASetup>)
    vi.mocked(useMFADisable).mockReturnValue(mockMutation as unknown as ReturnType<typeof useMFADisable>)
    vi.mocked(useUpdateOrganization).mockReturnValue(mockMutation as unknown as ReturnType<typeof useUpdateOrganization>)
  })

  it('renders SettingsPage without a11y violations', async () => {
    const { container } = renderPage()
    const results = await axe(container, axeConfig)
    expect(results).toHaveNoViolations()
  })
})
