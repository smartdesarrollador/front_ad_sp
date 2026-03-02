import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ResetPasswordPage from '../ResetPasswordPage'
import { useResetPassword } from '../hooks/useResetPassword'

vi.mock('../hooks/useResetPassword')

function makeWrapper(search = '') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[`/reset-password${search}`]}>
          <Routes>
            <Route path="/reset-password" element={<>{children}</>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useResetPassword>)
  })

  it('shows invalid token error when no token in URL', () => {
    render(<ResetPasswordPage />, { wrapper: makeWrapper() })
    expect(screen.getByText(/token inválido/i)).toBeInTheDocument()
  })

  it('renders password and confirm password fields when token is present', () => {
    render(<ResetPasswordPage />, { wrapper: makeWrapper('?token=abc123') })
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useResetPassword>)

    render(<ResetPasswordPage />, { wrapper: makeWrapper('?token=abc123') })

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'differentpass')
    await user.click(screen.getByRole('button', { name: /guardar contraseña/i }))

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('calls mutate with token and password on valid submit', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useResetPassword>)

    render(<ResetPasswordPage />, { wrapper: makeWrapper('?token=abc123') })

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'newpassword123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /guardar contraseña/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { token: 'abc123', password: 'newpassword123' },
      )
    })
  })
})
