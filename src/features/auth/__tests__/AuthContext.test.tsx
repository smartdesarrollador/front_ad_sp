import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MockAdapter from 'axios-mock-adapter'
import { publicClient } from '@/lib/api'
import { AuthProvider, useAuthContext } from '../AuthContext'
import { useAuthStore } from '@/store/authStore'

// Simple consumer for testing the context values
function Consumer() {
  const { isLoading, logout } = useAuthContext()
  const user = useAuthStore((s) => s.user)
  return (
    <div>
      {isLoading && <div>loading</div>}
      <div data-testid="user-email">{user?.email ?? 'no-user'}</div>
      <button onClick={logout}>logout</button>
    </div>
  )
}

function renderWithProviders() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

let mock: MockAdapter

beforeEach(() => {
  useAuthStore.setState({ user: null, tenant: null, accessToken: null, isAuthenticated: false })
  localStorage.clear()
  mock = new MockAdapter(publicClient)
})

afterEach(() => {
  mock.restore()
})

describe('AuthContext', () => {
  it('isLoading false and user null after mount with no refreshToken in localStorage', async () => {
    renderWithProviders()
    // With no refreshToken, AuthProvider sets isLoading=false synchronously (within React act)
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
    expect(screen.getByTestId('user-email').textContent).toBe('no-user')
  })

  it('restores session from localStorage when refreshToken exists and refresh succeeds', async () => {
    const mockUser = {
      id: 'u1',
      email: 'restored@example.com',
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User',
      roles: ['OrgAdmin'],
      permissions: [],
      status: 'active' as const,
      mfaEnabled: false,
      tenantId: 't1',
      lastLogin: null,
      createdAt: '2024-01-01T00:00:00Z',
    }
    localStorage.setItem('refreshToken', 'old-refresh-token')
    localStorage.setItem('authUser', JSON.stringify(mockUser))
    mock.onPost('/auth/refresh-token').reply(200, {
      access_token: 'new-access',
      refresh_token: 'new-refresh',
    })

    renderWithProviders()
    await waitFor(() =>
      expect(screen.getByTestId('user-email').textContent).toBe('restored@example.com'),
    )
    expect(screen.queryByText('loading')).not.toBeInTheDocument()
  })

  it('does not authenticate when no refreshToken in localStorage', async () => {
    renderWithProviders()
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())
    expect(screen.getByTestId('user-email').textContent).toBe('no-user')
  })

  it('logout clears localStorage and the store', async () => {
    localStorage.setItem('refreshToken', 'tok')
    localStorage.setItem('authUser', JSON.stringify({ email: 'x@x.com' }))
    mock.onPost('/auth/refresh-token').reply(500)

    renderWithProviders()
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument())

    // Set user directly to test logout clears it
    useAuthStore.setState({
      user: {
        id: 'u2',
        email: 'logged@example.com',
        firstName: 'L',
        lastName: 'U',
        name: 'LU',
        roles: [],
        permissions: [],
        status: 'active',
        mfaEnabled: false,
        is_staff: false,
        tenantId: 't1',
        lastLogin: null,
        createdAt: '2024-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    })
    localStorage.setItem('refreshToken', 'some-token')

    fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    await waitFor(() => expect(screen.getByTestId('user-email').textContent).toBe('no-user'))
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })
})
