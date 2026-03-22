import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppLayout from '../AppLayout'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useAuthContext } from '@/features/auth/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatureGate } from '@/hooks/useFeatureGate'

vi.mock('@/store/authStore')
vi.mock('@/store/uiStore')
vi.mock('@/features/auth/AuthContext')
vi.mock('@/hooks/usePermissions')
vi.mock('@/hooks/useFeatureGate')
vi.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => ({ notifications: [], unreadCount: 0, isLoading: false }),
}))
vi.mock('@/features/notifications/hooks/useMarkAsRead', () => ({
  useMarkAsRead: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('@/features/notifications/hooks/useMarkAllAsRead', () => ({
  useMarkAllAsRead: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es', changeLanguage: vi.fn() },
  }),
}))

const mockToggleSidebar = vi.fn()
const mockToggleDarkMode = vi.fn()
const mockSetSidebarOpen = vi.fn()
const mockLogout = vi.fn()

const mockUiState = {
  sidebarOpen: true,
  darkMode: false,
  notifications: [],
  toggleSidebar: mockToggleSidebar,
  toggleDarkMode: mockToggleDarkMode,
  setSidebarOpen: mockSetSidebarOpen,
  markNotificationRead: vi.fn(),
  activeModal: null,
  setActiveModal: vi.fn(),
  addNotification: vi.fn(),
  clearNotifications: vi.fn(),
}
// Note: notifications/markNotificationRead kept in mockUiState for store shape compatibility
// but Navbar now reads notifications from useNotifications() hook instead

const mockAuthState = {
  user: {
    id: '1',
    email: 'admin@acme.com',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['OrgAdmin'],
    permissions: ['users.read', 'roles.read', 'analytics.read', 'audit.read'],
    status: 'active' as const,
    mfaEnabled: false,
    tenantId: 't1',
    lastLogin: null,
    createdAt: '2026-01-01',
  },
  tenant: {
    id: 't1',
    name: 'Acme Corp',
    subdomain: 'acme',
    plan: 'professional',
  },
  accessToken: 'token',
  isAuthenticated: true,
  setUser: vi.fn(),
  setTenant: vi.fn(),
  setAccessToken: vi.fn(),
  clearAuth: vi.fn(),
}

function makeRouter(initialEntry = '/') {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [{ index: true, element: <div>Dashboard content</div> }],
      },
    ],
    { initialEntries: [initialEntry] },
  )
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useUiStore).mockReturnValue(mockUiState as ReturnType<typeof useUiStore>)

    vi.mocked(useAuthStore).mockImplementation((selector?: (s: typeof mockAuthState) => unknown) => {
      if (typeof selector === 'function') return selector(mockAuthState)
      return mockAuthState
    })

    vi.mocked(useAuthContext).mockReturnValue({
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
    })

    vi.mocked(usePermissions).mockReturnValue({
      hasPermission: () => true,
      hasRole: () => false,
      isOwner: false,
      isAdmin: true,
      canManageBilling: true,
      canUpgradePlan: false,
      getPrimaryRole: () => 'OrgAdmin',
      getRoleColor: () => '#dc2626',
    })

    vi.mocked(useFeatureGate).mockReturnValue({
      hasFeature: () => true,
      getLimit: () => null,
      plan: 'professional',
      isLoading: false,
    })
  })

  it('renders navbar and sidebar', () => {
    makeRouter()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('sidebar contains navigation links', () => {
    makeRouter()
    // t() mock returns the key, so 'menu.dashboard' → 'menu.dashboard', etc.
    expect(screen.getByRole('link', { name: /menu\.dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /menu\.users/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /menu\.roles/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /menu\.settings/i })).toBeInTheDocument()
  })

  it('toggle sidebar button calls toggleSidebar', async () => {
    const user = userEvent.setup()
    makeRouter()
    const menuButton = screen.getByRole('button', { name: /toggle sidebar/i })
    await user.click(menuButton)
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('dashboard link is marked active when on root route', () => {
    makeRouter('/')
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveClass('bg-primary-50')
  })
})
