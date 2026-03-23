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
