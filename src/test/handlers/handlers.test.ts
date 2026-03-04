import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../server'
import { apiClient, publicClient } from '@/lib/api'

describe('MSW handlers infrastructure', () => {
  it('GET /api/v1/features/ returns plan and features via MSW', async () => {
    const { data } = await apiClient.get('/features/')
    expect(data.plan).toBe('professional')
    expect(data.features).toBeDefined()
    expect(data.limits).toBeDefined()
  })

  it('POST /api/v1/auth/login returns access_token and user', async () => {
    const { data } = await publicClient.post('/auth/login', {
      email: 'test@example.com',
      password: 'password',
    })
    expect(data.access_token).toBe('mock-access-token')
    expect(data.user.email).toBe('admin@example.com')
  })

  it('server.use() override works within a test', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/features/', () =>
        HttpResponse.json({ plan: 'enterprise', features: {}, limits: {} }),
      ),
    )
    const { data } = await apiClient.get('/features/')
    expect(data.plan).toBe('enterprise')
  })
})
