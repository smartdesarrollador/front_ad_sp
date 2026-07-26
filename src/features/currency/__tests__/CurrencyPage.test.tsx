import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import CurrencyPage from '../CurrencyPage'
import type { AdminPlan } from '@/features/plans/types'
import type { CurrencyConfig } from '../types'

const mockConfig: CurrencyConfig = {
  usd_to_pen: '3.7500',
  default_display_currency: 'USD',
  source: 'manual',
  rates: { USD: '1.0000', PEN: '3.7500' },
  updated_at: '2026-07-26T03:03:08Z',
  updated_by_email: 'admin@rbac.local',
}

const mockPlans: AdminPlan[] = [
  {
    id: 'free',
    display_name: 'Free',
    description: 'Para explorar la plataforma',
    price_monthly: 0,
    price_annual: 0,
    popular: false,
    highlights: [],
    limits: {
      max_users: 5, storage_gb: 1, max_projects: 2, max_custom_roles: 0,
      api_calls_per_month: 1000, max_image_upload_mb: 2, max_file_upload_mb: 5,
    },
    updated_at: '2026-07-25T00:00:00Z',
  },
  {
    id: 'professional',
    display_name: 'Professional',
    description: 'Para empresas que necesitan escala y control',
    price_monthly: 79,
    price_annual: 854,
    popular: true,
    highlights: [],
    limits: {
      max_users: 25, storage_gb: 20, max_projects: null, max_custom_roles: 10,
      api_calls_per_month: 100000, max_image_upload_mb: 10, max_file_upload_mb: 25,
    },
    updated_at: '2026-07-25T00:00:00Z',
  },
]

const state = vi.hoisted(() => ({
  canEdit: true,
  isLoading: false,
  usdToPen: 3.75 as number | null,
  config: null as CurrencyConfig | null,
}))

vi.mock('../hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    config: state.config,
    usdToPen: state.usdToPen,
    isLoading: state.isLoading,
    isError: false,
  }),
}))

vi.mock('../hooks/useUpdateCurrencyConfig', () => ({
  useUpdateCurrencyConfig: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/features/plans/hooks/useAdminPlans', () => ({
  useAdminPlans: () => ({ plans: mockPlans, isLoading: false }),
}))

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: () => state.canEdit,
    hasRole: () => false,
    isOwner: false,
    isAdmin: true,
    canManageBilling: true,
    canUpgradePlan: false,
    getPrimaryRole: () => 'SuperAdmin',
    getRoleColor: () => '#2563eb',
  }),
}))

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <CurrencyPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('CurrencyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.canEdit = true
    state.isLoading = false
    state.usdToPen = 3.75
    state.config = mockConfig
  })

  it('muestra la cabecera', () => {
    renderPage()
    expect(screen.getByText('Moneda')).toBeInTheDocument()
  })

  it('deja claro que el dólar es la moneda base', () => {
    renderPage()
    expect(screen.getByText(/moneda base/i)).toBeInTheDocument()
  })

  it('muestra la tasa vigente con su origen y su autor', () => {
    renderPage()
    expect(screen.getByText('3.7500')).toBeInTheDocument()
    expect(screen.getByText('Manual')).toBeInTheDocument()
    expect(screen.getByText(/admin@rbac.local/)).toBeInTheDocument()
  })

  it('convierte los precios de los planes en la tabla', () => {
    renderPage()
    expect(screen.getByText('$79')).toBeInTheDocument()
    expect(screen.getByText('S/ 296')).toBeInTheDocument()
    expect(screen.getByText('$854')).toBeInTheDocument()
    expect(screen.getByText('S/ 3,203')).toBeInTheDocument()
  })

  it('muestra el skeleton mientras carga, sin tarjeta de estado', () => {
    state.isLoading = true
    state.config = null
    const { container } = renderPage()
    expect(screen.queryByText('3.7500')).not.toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('sin permiso no ofrece edición pero sí explica por qué', () => {
    state.canEdit = false
    renderPage()
    expect(screen.queryByRole('button', { name: /Guardar/i })).not.toBeInTheDocument()
    expect(screen.getByText(/subscriptions.manage/)).toBeInTheDocument()
    // La consulta sigue siendo útil aunque no se pueda editar.
    expect(screen.getByText('$79')).toBeInTheDocument()
  })

  it('sin tasa deja las celdas en soles vacías en vez de inventar un cero', () => {
    state.usdToPen = null
    state.config = null
    renderPage()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(screen.queryByText('S/ 296')).not.toBeInTheDocument()
  })
})
