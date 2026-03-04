import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions } from '../usePermissions'
import { useAuthStore } from '@/store/authStore'

const baseUser = {
  id: 'u1',
  email: 'user@example.com',
  firstName: 'Test',
  lastName: 'User',
  name: 'Test User',
  status: 'active' as const,
  mfaEnabled: false,
  tenantId: 't1',
  lastLogin: null,
  createdAt: '2024-01-01T00:00:00Z',
  roles: [] as string[],
  permissions: [] as string[],
}

const baseTenant = {
  id: 't1',
  name: 'Org',
  subdomain: 'org',
  plan: 'professional',
}

afterEach(() => {
  useAuthStore.setState({ user: null, tenant: null, accessToken: null, isAuthenticated: false })
})

describe('usePermissions', () => {
  it('isAdmin=true for OrgAdmin, isOwner=false', () => {
    useAuthStore.setState({
      user: { ...baseUser, roles: ['OrgAdmin'], permissions: [] },
      tenant: baseTenant,
      isAuthenticated: true,
    })
    const { result } = renderHook(() => usePermissions())
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isOwner).toBe(false)
  })

  it('isOwner=true and isAdmin=true for Owner role', () => {
    useAuthStore.setState({
      user: { ...baseUser, roles: ['Owner'], permissions: [] },
      tenant: baseTenant,
      isAuthenticated: true,
    })
    const { result } = renderHook(() => usePermissions())
    expect(result.current.isOwner).toBe(true)
    expect(result.current.isAdmin).toBe(true)
  })

  it('hasPermission returns true only for permissions in the array', () => {
    useAuthStore.setState({
      user: { ...baseUser, roles: ['Member'], permissions: ['users.invite', 'audit.view_auditlog'] },
      tenant: baseTenant,
      isAuthenticated: true,
    })
    const { result } = renderHook(() => usePermissions())
    expect(result.current.hasPermission('users.invite')).toBe(true)
    expect(result.current.hasPermission('users.delete')).toBe(false)
  })

  it('canUpgradePlan true on free/starter, false on professional/enterprise', () => {
    useAuthStore.setState({
      user: { ...baseUser, roles: ['Member'], permissions: [] },
      tenant: { ...baseTenant, plan: 'free' },
      isAuthenticated: true,
    })
    const { result: r1 } = renderHook(() => usePermissions())
    expect(r1.current.canUpgradePlan).toBe(true)

    useAuthStore.setState({ tenant: { ...baseTenant, plan: 'starter' } })
    const { result: r2 } = renderHook(() => usePermissions())
    expect(r2.current.canUpgradePlan).toBe(true)

    useAuthStore.setState({ tenant: { ...baseTenant, plan: 'professional' } })
    const { result: r3 } = renderHook(() => usePermissions())
    expect(r3.current.canUpgradePlan).toBe(false)

    useAuthStore.setState({ tenant: { ...baseTenant, plan: 'enterprise' } })
    const { result: r4 } = renderHook(() => usePermissions())
    expect(r4.current.canUpgradePlan).toBe(false)
  })

  it("getPrimaryRole returns first role or 'Guest' when user is null", () => {
    useAuthStore.setState({ user: null, isAuthenticated: false })
    const { result: r1 } = renderHook(() => usePermissions())
    expect(r1.current.getPrimaryRole()).toBe('Guest')

    useAuthStore.setState({
      user: { ...baseUser, roles: ['Manager', 'Member'] },
      isAuthenticated: true,
    })
    const { result: r2 } = renderHook(() => usePermissions())
    expect(r2.current.getPrimaryRole()).toBe('Manager')
  })

  it('getRoleColor returns known color for Owner and fallback for unknown role', () => {
    useAuthStore.setState({
      user: { ...baseUser, roles: ['Owner'] },
      isAuthenticated: true,
    })
    const { result: r1 } = renderHook(() => usePermissions())
    expect(r1.current.getRoleColor()).toBe('#dc2626')

    useAuthStore.setState({
      user: { ...baseUser, roles: ['CustomRole'] },
      isAuthenticated: true,
    })
    const { result: r2 } = renderHook(() => usePermissions())
    expect(r2.current.getRoleColor()).toBe('#6b7280')
  })
})
