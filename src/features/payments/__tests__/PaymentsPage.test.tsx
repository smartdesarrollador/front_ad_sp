import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import PaymentsPage from '../PaymentsPage'
import type { PaymentMethodConfig, PaymentProof } from '../types'

const proof: PaymentProof = {
  id: 'proof-1',
  method: 'paypal',
  charge_currency: 'USD',
  transaction_reference: '8XY12345AB',
  screenshot_url: '',
  plan: 'starter',
  billing_cycle: 'monthly',
  amount: '19.00',
  exchange_rate: '3.7500',
  amount_pen: '71.25',
  promo: null,
  status: 'pending',
  tenant_name: 'Acme',
  tenant_email: 'owner@acme.com',
  tenant_slug: 'acme',
  created_at: '2026-07-19T10:00:00Z',
  reviewed_at: null,
}

const methods: PaymentMethodConfig[] = [
  {
    method: 'yape', display_name: 'Yape', is_enabled: true, is_configured: true,
    sort_order: 1, holder_name: 'Juan Pérez', phone: '955365043',
    checkout_url: '', account_email: '', instructions_note: '',
    updated_at: '2026-07-25T00:00:00Z',
  },
  {
    method: 'paypal', display_name: 'PayPal', is_enabled: false, is_configured: false,
    sort_order: 2, holder_name: '', phone: '',
    checkout_url: '', account_email: '', instructions_note: '', updated_at: null,
  },
]

const state = vi.hoisted(() => ({
  usePaymentProofs: vi.fn(),
}))

vi.mock('../hooks/usePaymentProofs', () => ({
  usePaymentProofs: (args: unknown) => state.usePaymentProofs(args),
}))

vi.mock('../hooks/usePaymentMethods', () => ({
  usePaymentMethods: () => ({ methods, isLoading: false }),
}))

vi.mock('../hooks/useUpdatePaymentMethod', () => ({
  useUpdatePaymentMethod: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('../hooks/useReviewProof', () => ({
  useReviewProof: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/features/currency/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    config: { usd_to_pen: '3.7500' }, usdToPen: 3.75, isLoading: false, isError: false,
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
  const router = createMemoryRouter([{ path: '/', element: <PaymentsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('PaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.usePaymentProofs.mockReturnValue({
      proofs: [proof],
      kpi: { total: 1, pending: 1, approved: 0, rejected: 0 },
      pagination: { page: 1, per_page: 5, total: 1, total_pages: 1 },
      isLoading: false,
    })
  })

  it('abre en Comprobantes: revisar pagos es el trabajo diario', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Pagos' })).toBeInTheDocument()
    expect(screen.getByText('owner@acme.com')).toBeInTheDocument()
    // La configuración de un método no está a la vista al entrar.
    expect(screen.queryByLabelText('Número Yape')).not.toBeInTheDocument()
  })

  it('marca en la pestaña cuántos comprobantes esperan revisión', () => {
    renderPage()

    const tab = screen.getByRole('button', { name: /Comprobantes/ })
    expect(tab.querySelector('.bg-yellow-500')?.textContent).toBe('1')
  })

  it('pasa el método elegido al hook que consulta la cola', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.selectOptions(screen.getByLabelText('Método'), 'paypal')

    expect(state.usePaymentProofs).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'paypal', page: 1 }),
    )
  })

  it('la pestaña de métodos monta una tarjeta por método', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Métodos de pago' }))

    expect(screen.getByLabelText('Número Yape')).toBeInTheDocument()
    expect(screen.getByLabelText('Enlace de pago')).toBeInTheDocument()
  })
})
