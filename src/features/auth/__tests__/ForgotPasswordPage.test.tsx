import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ForgotPasswordPage from '../ForgotPasswordPage'
import { useForgotPassword } from '../hooks/useForgotPassword'

vi.mock('../hooks/useForgotPassword')

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.mocked(useForgotPassword).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useForgotPassword>)
  })

  it('renders email field and submit button', () => {
    render(<ForgotPasswordPage />, { wrapper })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar instrucciones/i })).toBeInTheDocument()
  })

  it('hides form and shows confirmation message on success', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn(
      (_email: unknown, opts: { onSuccess?: () => void } = {}) => {
        opts.onSuccess?.()
      },
    )
    vi.mocked(useForgotPassword).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useForgotPassword>)

    render(<ForgotPasswordPage />, { wrapper })

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /enviar instrucciones/i }))

    await waitFor(() => {
      expect(screen.getByText(/instrucciones enviadas/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /enviar instrucciones/i })).not.toBeInTheDocument()
    })
  })

  it('shows generic error message on network failure', () => {
    vi.mocked(useForgotPassword).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
    } as unknown as ReturnType<typeof useForgotPassword>)

    render(<ForgotPasswordPage />, { wrapper })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/ocurrió un error/i)).toBeInTheDocument()
  })

  it('has a link back to login page', () => {
    render(<ForgotPasswordPage />, { wrapper })
    expect(screen.getByRole('link', { name: /volver al inicio de sesión/i })).toBeInTheDocument()
  })
})
