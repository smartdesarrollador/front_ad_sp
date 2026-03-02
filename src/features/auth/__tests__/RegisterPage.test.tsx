import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RegisterPage from '../RegisterPage'
import { useRegister } from '../hooks/useRegister'

vi.mock('../hooks/useRegister')

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.mocked(useRegister).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useRegister>)
  })

  it('renders all required fields', () => {
    render(<RegisterPage />, { wrapper })
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre de la organización/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/acepto/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />, { wrapper })

    await user.type(screen.getByLabelText(/^email$/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })

  it('blocks submit when passwords do not match', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRegister>)

    render(<RegisterPage />, { wrapper })

    await user.type(screen.getByLabelText(/nombre completo/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'john@example.com')
    await user.type(screen.getByLabelText(/nombre de la organización/i), 'Acme Corp')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'different456')
    await user.click(screen.getByLabelText(/acepto/i))
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('shows confirmation message on successful registration', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn(
      (_data: unknown, opts: { onSuccess?: () => void } = {}) => {
        opts.onSuccess?.()
      },
    )
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRegister>)

    render(<RegisterPage />, { wrapper })

    await user.type(screen.getByLabelText(/nombre completo/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'john@example.com')
    await user.type(screen.getByLabelText(/nombre de la organización/i), 'Acme Corp')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123')
    await user.click(screen.getByLabelText(/acepto/i))
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/revisa tu correo/i)).toBeInTheDocument()
    })
  })

  it('shows field error when email is already registered (400)', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn(
      (_data: unknown, opts: { onError?: (e: unknown) => void } = {}) => {
        opts.onError?.({
          isAxiosError: true,
          response: {
            status: 400,
            data: { email: ['Este email ya está registrado.'] },
          },
        })
      },
    )
    vi.mocked(useRegister).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRegister>)

    render(<RegisterPage />, { wrapper })

    await user.type(screen.getByLabelText(/nombre completo/i), 'John Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/nombre de la organización/i), 'Acme Corp')
    await user.type(screen.getByLabelText(/^contraseña$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'password123')
    await user.click(screen.getByLabelText(/acepto/i))
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/este email ya está registrado/i)).toBeInTheDocument()
    })
  })
})
