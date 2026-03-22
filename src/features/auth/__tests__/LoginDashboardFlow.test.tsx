import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { AuthProvider } from '../AuthContext'
import LoginPage from '../LoginPage'
import { useAuthStore } from '@/store/authStore'

function buildRouter() {
  return createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        ),
        children: [
          { index: true, element: <div data-testid="dashboard">Dashboard</div> },
          { path: 'login', element: <LoginPage /> },
        ],
      },
    ],
    { initialEntries: ['/login'] },
  )
}

function renderApp() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={buildRouter()} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  useAuthStore.setState({ user: null, tenant: null, accessToken: null, isAuthenticated: false })
  localStorage.clear()
})

describe('Login → Dashboard integration flow', () => {
  it('unauthenticated user sees login page and not the dashboard', async () => {
    renderApp()
    await waitFor(() => expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument()
  })

  it('successful login navigates to dashboard', async () => {
    renderApp()
    await waitFor(() => expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument(), { timeout: 5000 })

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument(), { timeout: 5000 })
  })

  it('invalid credentials show error message', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/auth/login', () => new HttpResponse(null, { status: 401 })),
    )

    renderApp()
    await waitFor(() => expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument(), { timeout: 5000 })

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'wrongpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() =>
      expect(screen.getByText(/credenciales incorrectas/i)).toBeInTheDocument(),
      { timeout: 5000 },
    )
  })
})
