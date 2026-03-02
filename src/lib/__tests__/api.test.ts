import { describe, it, expect, beforeEach, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { apiClient, publicClient } from '../api'
import { useAuthStore } from '@/store/authStore'

// Reset Zustand store and mocks before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: 'old-access-token',
    isAuthenticated: true,
  })
  localStorage.clear()
  vi.clearAllMocks()
})

describe('apiClient interceptors', () => {
  it('retries original request with new token after successful refresh', async () => {
    const mockApi = new MockAdapter(apiClient)
    const mockPublic = new MockAdapter(publicClient)

    // First call → 401, second call → 200
    mockApi
      .onGet('/test')
      .replyOnce(401)
      .onGet('/test')
      .replyOnce(200, { ok: true })

    mockPublic
      .onPost('/auth/token/refresh/')
      .replyOnce(200, { access: 'new-access-token' })

    localStorage.setItem('refreshToken', 'valid-refresh-token')

    const response = await apiClient.get('/test')

    expect(response.data).toEqual({ ok: true })
    expect(useAuthStore.getState().accessToken).toBe('new-access-token')

    mockApi.restore()
    mockPublic.restore()
  })

  it('clears auth and rejects when refreshToken is missing from localStorage', async () => {
    const mockApi = new MockAdapter(apiClient)

    mockApi.onGet('/test').replyOnce(401)

    // No refreshToken in localStorage
    localStorage.removeItem('refreshToken')

    await expect(apiClient.get('/test')).rejects.toBeDefined()

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().accessToken).toBeNull()

    mockApi.restore()
  })
})
