import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from '../LoginPage'
import { useLogin } from '../hooks/useLogin'

vi.mock('../hooks/useLogin')

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useLogin>)
  })

  it('renders email and password fields with submit button', () => {
    render(<LoginPage />, { wrapper })
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('calls mutate with credentials on valid submit', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useLogin>)

    render(<LoginPage />, { wrapper })

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        expect.any(Object),
      )
    })
  })

  it('shows error message on 401 response', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn(
      (_data: unknown, opts: { onError?: (e: unknown) => void } = {}) => {
        opts.onError?.({ isAxiosError: true, response: { status: 401 } })
      },
    )
    vi.mocked(useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useLogin>)

    render(<LoginPage />, { wrapper })

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText(/credenciales incorrectas/i)).toBeInTheDocument()
    })
  })

  it('shows spinner and disables submit button while loading', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useLogin>)

    render(<LoginPage />, { wrapper })

    // Button shows sr-only "Cargando..." when isPending
    const button = screen.getByRole('button', { name: /cargando/i })
    expect(button).toBeDisabled()
    expect(button.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does not render a register link', () => {
    render(<LoginPage />, { wrapper })
    expect(screen.queryByRole('link', { name: /crear cuenta/i })).not.toBeInTheDocument()
  })

  it('renders invitation-only message', () => {
    render(<LoginPage />, { wrapper })
    expect(screen.getByText(/acceso solo por invitación/i)).toBeInTheDocument()
  })
})
