import { http, HttpResponse } from 'msw'

// Base URL must match what Axios uses in tests (VITE_API_URL from .env = http://localhost:8000)
const API = 'http://localhost:8000/api/v1'

const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  name: 'Admin User',
  roles: ['OrgAdmin'],
  permissions: ['users.invite', 'users.update', 'audit.read'],
  status: 'active' as const,
  mfaEnabled: false,
  tenantId: 'tenant-1',
  lastLogin: null,
  createdAt: '2024-01-01T00:00:00Z',
}

const mockTenant = {
  id: 'tenant-1',
  name: 'Test Org',
  subdomain: 'test',
  plan: 'professional',
}

export const handlers = [
  http.post(`${API}/auth/login`, () =>
    HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: mockUser,
      tenant: mockTenant,
    }),
  ),

  http.post(`${API}/auth/refresh-token`, () =>
    HttpResponse.json({
      access_token: 'mock-access-token-refreshed',
      refresh_token: 'mock-refresh-token-refreshed',
    }),
  ),

  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/features/`, () =>
    HttpResponse.json({
      plan: 'professional',
      features: {
        analytics: true,
        analytics_trends: true,
        analytics_export: false,
        audit_logs: true,
        audit_export: true,
      },
      limits: {
        users: 50,
        projects: null,
        storage_gb: 100,
        api_calls_per_month: 10000,
      },
    }),
  ),

  http.get(`${API}/admin/users/`, () =>
    HttpResponse.json({
      users: [mockUser],
    }),
  ),
]
