import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BillingPage from '../BillingPage'
import { usePermissions } from '@/hooks/usePermissions'
import { useInvoices } from '../hooks/useInvoices'
import { usePaymentMethods } from '../hooks/usePaymentMethods'

vi.mock('@/hooks/usePermissions')
vi.mock('../hooks/useInvoices')
vi.mock('../hooks/usePaymentMethods')

const mockPermissionsAdmin = {
  hasPermission: () => true,
  hasRole: () => false,
  isOwner: false,
  isAdmin: true,
  canManageBilling: true,
  canUpgradePlan: false,
  getPrimaryRole: () => 'OrgAdmin',
  getRoleColor: () => '#dc2626',
}

const mockInvoices = [
  {
    id: 'inv-1',
    amount_cents: 2900,
    amount_display: '$29.00',
    currency: 'usd',
    status: 'paid' as const,
    pdf_url: 'https://stripe.com/invoice-1.pdf',
    period_start: '2026-01-01T00:00:00Z',
    period_end: '2026-02-01T00:00:00Z',
    invoice_date: '2026-01-01T00:00:00Z',
    paid_at: '2026-01-02T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'inv-2',
    amount_cents: 2900,
    amount_display: '$29.00',
    currency: 'usd',
    status: 'open' as const,
    pdf_url: '',
    period_start: '2026-02-01T00:00:00Z',
    period_end: '2026-03-01T00:00:00Z',
    invoice_date: '2026-02-01T00:00:00Z',
    paid_at: null,
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'inv-3',
    amount_cents: 2900,
    amount_display: '$29.00',
    currency: 'usd',
    status: 'void' as const,
    pdf_url: '',
    period_start: '2025-12-01T00:00:00Z',
    period_end: '2026-01-01T00:00:00Z',
    invoice_date: '2025-12-01T00:00:00Z',
    paid_at: null,
    created_at: '2025-12-01T00:00:00Z',
  },
]

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <BillingPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
    vi.mocked(usePaymentMethods).mockReturnValue({ methods: [], isLoading: false })
  })

  it('renders with invoices and shows correct status badges', () => {
    vi.mocked(useInvoices).mockReturnValue({ invoices: mockInvoices, isLoading: false })

    renderPage()

    expect(screen.getByText('Pagado')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Anulado')).toBeInTheDocument()
  })

  it('renders PDF download link with correct href and target="_blank"', () => {
    vi.mocked(useInvoices).mockReturnValue({ invoices: mockInvoices, isLoading: false })

    renderPage()

    const pdfLink = screen.getByRole('link', { name: /descargar pdf/i })
    expect(pdfLink).toHaveAttribute('href', 'https://stripe.com/invoice-1.pdf')
    expect(pdfLink).toHaveAttribute('target', '_blank')
  })

  it('paid badge has green CSS classes', () => {
    vi.mocked(useInvoices).mockReturnValue({ invoices: mockInvoices, isLoading: false })

    renderPage()

    const paidBadge = screen.getByText('Pagado')
    expect(paidBadge.className).toContain('bg-green-100')
    expect(paidBadge.className).toContain('text-green-800')
  })

  it('shows skeleton rows while loading', () => {
    vi.mocked(useInvoices).mockReturnValue({ invoices: [], isLoading: true })

    const { container } = renderPage()

    const skeletonRows = container.querySelectorAll('tr.animate-pulse')
    expect(skeletonRows.length).toBeGreaterThan(0)
  })

  it('shows access limited banner when canManageBilling is false', () => {
    vi.mocked(usePermissions).mockReturnValue({
      ...mockPermissionsAdmin,
      canManageBilling: false,
    })
    vi.mocked(useInvoices).mockReturnValue({ invoices: [], isLoading: false })

    renderPage()

    expect(screen.getByText('Acceso limitado')).toBeInTheDocument()
  })
})
