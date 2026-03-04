import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { server } from '@/test/server'
import { useFeatureGate } from '../useFeatureGate'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useFeatureGate', () => {
  it('isLoading true initially, false after successful fetch', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useFeatureGate(), { wrapper })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('hasFeature true for active feature, false for nonexistent', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useFeatureGate(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasFeature('analytics')).toBe(true)
    expect(result.current.hasFeature('nonexistent_feature')).toBe(false)
  })

  it("plan returns 'professional' from the default handler", async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useFeatureGate(), { wrapper })
    await waitFor(() => expect(result.current.plan).toBe('professional'))
  })

  it("getLimit returns numeric value for 'users', null for 'projects'", async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useFeatureGate(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.getLimit('users')).toBe(50)
    expect(result.current.getLimit('projects')).toBeNull()
  })

  it('hasFeature false and plan undefined when server returns 500', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/features/', () => new HttpResponse(null, { status: 500 })),
    )
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useFeatureGate(), { wrapper })
    // On error, data stays undefined so isLoading remains true (it's !data)
    await waitFor(() => expect(result.current.plan).toBeUndefined())
    expect(result.current.hasFeature('analytics')).toBe(false)
  })
})
