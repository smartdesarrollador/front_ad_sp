import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PlansPage from '../PlansPage'
import type { AdminPlan } from '../types'

const mockPlans: AdminPlan[] = [
  {
    id: 'free',
    display_name: 'Free',
    description: 'Para explorar la plataforma',
    price_monthly: 0,
    price_annual: 0,
    popular: false,
    highlights: [{ label: 'Hasta 5 usuarios', included: true }],
    limits: {
      max_users: 5,
      storage_gb: 1,
      max_projects: 2,
      max_custom_roles: 0,
      api_calls_per_month: 1000,
      max_image_upload_mb: 2,
      max_file_upload_mb: 5,
    },
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'professional',
    display_name: 'Professional',
    description: 'Para empresas que necesitan escala y control',
    price_monthly: 79,
    price_annual: 854,
    popular: true,
    highlights: [
      { label: 'Hasta 25 usuarios', included: true },
      { label: 'SSO/SAML', included: false },
    ],
    limits: {
      max_users: 25,
      storage_gb: 20,
      max_projects: null,
      max_custom_roles: 10,
      api_calls_per_month: 100000,
      max_image_upload_mb: 10,
      max_file_upload_mb: 25,
    },
    updated_at: '2026-03-01T00:00:00Z',
  },
]

vi.mock('../hooks/useAdminPlans', () => ({
  useAdminPlans: () => ({ plans: mockPlans, isLoading: false }),
}))

vi.mock('../hooks/useUpdatePlan', () => ({
  useUpdatePlan: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

// Sin este mock el hook real saldría a la red: MSW está en onUnhandledRequest 'bypass'.
vi.mock('@/features/currency/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    config: null,
    usdToPen: 3.75,
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: () => true,
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
  const router = createMemoryRouter([{ path: '/', element: <PlansPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header', () => {
    renderPage()
    expect(screen.getByText('Gestión de Planes')).toBeInTheDocument()
  })

  it('renders plan cards from hook', () => {
    renderPage()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Professional')).toBeInTheDocument()
  })

  it('shows immutable IDs info banner', () => {
    renderPage()
    expect(screen.getByText(/IDs de plan/)).toBeInTheDocument()
    expect(screen.getByText(/inmutables/)).toBeInTheDocument()
  })

  it('shows plan price', () => {
    renderPage()
    expect(screen.getByText('$79')).toBeInTheDocument()
    expect(screen.getByText('$854/año')).toBeInTheDocument()
  })

  it('muestra la referencia en soles bajo el precio', () => {
    renderPage()
    // 79 × 3.75 = 296.25 → S/ 296 (los precios de catálogo van sin céntimos)
    expect(screen.getByText('≈ S/ 296/mes')).toBeInTheDocument()
  })

  it('no muestra referencia en soles en un plan gratuito', () => {
    renderPage()
    // "≈ S/ 0/mes" no informa de nada.
    expect(screen.queryByText('≈ S/ 0/mes')).not.toBeInTheDocument()
  })

  it('shows popular badge for professional', () => {
    renderPage()
    expect(screen.getByText('Más popular')).toBeInTheDocument()
  })

  it('opens edit modal when edit button is clicked', () => {
    renderPage()
    const editButtons = screen.getAllByRole('button', { name: /editar plan/i })
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders upload-limit fields in the edit modal', () => {
    renderPage()
    const editButtons = screen.getAllByRole('button', { name: /editar plan/i })
    fireEvent.click(editButtons[0])
    expect(screen.getByText('Peso máx. imagen (MB)')).toBeInTheDocument()
    expect(screen.getByText('Peso máx. archivo (MB)')).toBeInTheDocument()
  })

  it('closes edit modal when close button is clicked', async () => {
    renderPage()
    const editButtons = screen.getAllByRole('button', { name: /editar plan/i })
    fireEvent.click(editButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const closeButton = screen.getByRole('button', { name: /cerrar modal/i })
    fireEvent.click(closeButton)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
