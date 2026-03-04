import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

vi.mock('../hooks/useAuth')

function renderWithRouter(isLoading: boolean, isAuthenticated: boolean) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  vi.mocked(useAuth).mockReturnValue({
    isLoading,
    isAuthenticated,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  })

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <div data-testid="protected-content">Protected</div> }],
      },
      { path: '/login', element: <div data-testid="login-page">Login</div> },
    ],
    { initialEntries: ['/'] },
  )

  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows spinner while isLoading=true', () => {
    renderWithRouter(true, false)
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('redirects to /login when not loading and not authenticated', () => {
    renderWithRouter(false, false)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('renders child (Outlet) when authenticated', () => {
    renderWithRouter(false, true)
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('does NOT redirect to /login while isLoading=true even if not authenticated', () => {
    renderWithRouter(true, false)
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
  })
})
