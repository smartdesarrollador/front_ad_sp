import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AcceptInvitePage from '../AcceptInvitePage'
import { useAcceptInvite } from '../hooks/useAcceptInvite'

vi.mock('../hooks/useAcceptInvite')

function makeWrapper(search = '') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[`/accept-invite${search}`]}>
          <Routes>
            <Route path="/accept-invite" element={<>{children}</>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('AcceptInvitePage', () => {
  beforeEach(() => {
    vi.mocked(useAcceptInvite).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useAcceptInvite>)
  })

  it('shows error state when no token in URL', () => {
    render(<AcceptInvitePage />, { wrapper: makeWrapper() })
    expect(screen.getByRole('alert')).toHaveTextContent(/no es válido o ha expirado/i)
    expect(screen.getByRole('link', { name: /volver al inicio de sesión/i })).toBeInTheDocument()
  })

  it('renders password fields when token is present', () => {
    render(<AcceptInvitePage />, { wrapper: makeWrapper('?token=abc123') })
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /activar cuenta/i })).toBeInTheDocument()
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    vi.mocked(useAcceptInvite).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useAcceptInvite>)

    render(<AcceptInvitePage />, { wrapper: makeWrapper('?token=abc123') })

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'differentpass')
    await user.click(screen.getByRole('button', { name: /activar cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('calls mutate with token and password on valid submit', async () => {
    const user = userEvent.setup()
    const mockMutate = vi.fn()
    vi.mocked(useAcceptInvite).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useAcceptInvite>)

    render(<AcceptInvitePage />, { wrapper: makeWrapper('?token=mytoken') })

    await user.type(screen.getByLabelText(/nueva contraseña/i), 'newpassword123')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'newpassword123')
    await user.click(screen.getByRole('button', { name: /activar cuenta/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ token: 'mytoken', password: 'newpassword123' })
    })
  })

  it('shows error alert when mutation fails', () => {
    vi.mocked(useAcceptInvite).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
    } as unknown as ReturnType<typeof useAcceptInvite>)

    render(<AcceptInvitePage />, { wrapper: makeWrapper('?token=abc123') })
    expect(screen.getByRole('alert')).toHaveTextContent(/inválido o ha expirado/i)
  })

  it('shows spinner and disables button while loading', () => {
    vi.mocked(useAcceptInvite).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      isError: false,
    } as unknown as ReturnType<typeof useAcceptInvite>)

    render(<AcceptInvitePage />, { wrapper: makeWrapper('?token=abc123') })

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByText(/activando\.\.\./i)).toBeInTheDocument()
  })
})
