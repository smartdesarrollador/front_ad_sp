import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLogin } from '../useLogin'
import type { LoginResult } from '../../AuthContext'

vi.mock('@/features/auth/AuthContext')
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
  useNavigate: vi.fn(),
}))

import { useAuthContext } from '@/features/auth/AuthContext'
import { useNavigate } from 'react-router-dom'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc },
      createElement(MemoryRouter, null, children),
    )
}

describe('useLogin', () => {
  const mockNavigate = vi.fn()
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useAuthContext).mockReturnValue({
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
    })
    mockNavigate.mockClear()
    mockLogin.mockClear()
  })

  it('mutate calls login with email and password', async () => {
    mockLogin.mockResolvedValue({ ok: true } satisfies LoginResult)
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() })
    act(() => {
      result.current.mutate({ email: 'test@example.com', password: 'pass123' })
    })
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'pass123'))
  })

  it("navigates to '/' when login returns { ok: true }", async () => {
    mockLogin.mockResolvedValue({ ok: true } satisfies LoginResult)
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() })
    act(() => {
      result.current.mutate({ email: 'a@b.com', password: 'pw' })
    })
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
  })

  it('does NOT navigate when login returns { mfaRequired: true }', async () => {
    mockLogin.mockResolvedValue({ mfaRequired: true, mfaToken: 'tok' } satisfies LoginResult)
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() })
    act(() => {
      result.current.mutate({ email: 'a@b.com', password: 'pw' })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('isError=true when login throws', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() })
    act(() => {
      result.current.mutate({ email: 'a@b.com', password: 'wrong' })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
