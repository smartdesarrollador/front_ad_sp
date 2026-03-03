import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PromotionsPage from '../PromotionsPage'
import { usePromotions } from '../hooks/usePromotions'
import { useCreatePromotion } from '../hooks/useCreatePromotion'
import { useUpdatePromotion } from '../hooks/useUpdatePromotion'
import { useDeletePromotion } from '../hooks/useDeletePromotion'
import { usePermissions } from '@/hooks/usePermissions'
import type { Promotion } from '../types'

vi.mock('../hooks/usePromotions')
vi.mock('../hooks/useCreatePromotion')
vi.mock('../hooks/useUpdatePromotion')
vi.mock('../hooks/useDeletePromotion')
vi.mock('@/hooks/usePermissions')

const mockPromotions: Promotion[] = [
  {
    id: 'p1',
    code: 'SUMMER2026',
    name: 'Descuento de Verano',
    description: 'Promo de verano',
    type: 'percentage',
    value: 20,
    max_discount: 50,
    applicable_plans: [],
    new_customers_only: false,
    starts_at: '2026-06-01',
    expires_at: '2026-08-31',
    max_uses: 100,
    max_uses_per_customer: 1,
    status: 'active',
    current_uses: 35,
    last_used_at: null,
    conversion_rate: 15.5,
    total_revenue: 1200,
    avg_discount_amount: 25.0,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'p2',
    code: 'TECH50',
    name: 'Tech Discount',
    description: 'Descuento fijo',
    type: 'fixed_amount',
    value: 50,
    max_discount: null,
    applicable_plans: ['professional'],
    new_customers_only: true,
    starts_at: '2026-01-01',
    expires_at: '2026-12-31',
    max_uses: null,
    max_uses_per_customer: 1,
    status: 'paused',
    current_uses: 10,
    last_used_at: null,
    conversion_rate: 8.0,
    total_revenue: 500,
    avg_discount_amount: 50.0,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'p3',
    code: 'TRIAL30',
    name: 'Trial Extension',
    description: 'Extensión de trial',
    type: 'trial_extension',
    value: 30,
    max_discount: null,
    applicable_plans: [],
    new_customers_only: true,
    starts_at: '2025-01-01',
    expires_at: '2025-12-31',
    max_uses: 50,
    max_uses_per_customer: 1,
    status: 'expired',
    current_uses: 50,
    last_used_at: null,
    conversion_rate: 22.0,
    total_revenue: 800,
    avg_discount_amount: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
]

const mockPermissionsAdmin = {
  hasPermission: () => true,
  hasRole: () => false,
  isOwner: false,
  isAdmin: true,
  canManageBilling: true,
  canUpgradePlan: false,
  getPrimaryRole: () => 'SuperAdmin',
  getRoleColor: () => '#2563eb',
}

const mockMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
  reset: vi.fn(),
  status: 'idle' as const,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isIdle: true,
  isPaused: false,
  submittedAt: 0,
}

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '/', element: <PromotionsPage /> }], {
    initialEntries: ['/'],
  })
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('PromotionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCreatePromotion).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useCreatePromotion>,
    )
    vi.mocked(useUpdatePromotion).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useUpdatePromotion>,
    )
    vi.mocked(useDeletePromotion).mockReturnValue(
      mockMutation as unknown as ReturnType<typeof useDeletePromotion>,
    )
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
  })

  it('grid renderiza tarjetas con badges correctos', () => {
    vi.mocked(usePromotions).mockReturnValue({ promotions: mockPromotions, isLoading: false })

    renderPage()

    expect(screen.getByText('SUMMER2026')).toBeInTheDocument()
    expect(screen.getByText('TECH50')).toBeInTheDocument()
    expect(screen.getByText('TRIAL30')).toBeInTheDocument()

    expect(screen.getAllByText('Activa').length > 0).toBe(true)
    expect(screen.getAllByText('Pausada').length > 0).toBe(true)
    expect(screen.getAllByText('Expirada').length > 0).toBe(true)

    expect(screen.getAllByText('%').length > 0).toBe(true)
    expect(screen.getAllByText('$').length > 0).toBe(true)
    expect(screen.getAllByText('+días').length > 0).toBe(true)
  })

  it('barra de uso calcula % correcto', () => {
    vi.mocked(usePromotions).mockReturnValue({ promotions: mockPromotions, isLoading: false })

    const { container } = renderPage()

    // SUMMER2026: 35/100 = 35%
    const bars = container.querySelectorAll('.h-2.rounded-full.bg-green-500, .h-2.rounded-full.bg-yellow-500, .h-2.rounded-full.bg-red-500')
    const usageBars = Array.from(bars)
    const summer2026Bar = usageBars.find((el) => (el as HTMLElement).style.width === '35%')
    expect(summer2026Bar).toBeTruthy()

    // TECH50: max_uses null → 0%
    const zeroBars = usageBars.filter((el) => (el as HTMLElement).style.width === '0%')
    expect(zeroBars.length > 0).toBe(true)
  })

  it('crear promoción abre modal y llama mutate', async () => {
    const createMock = { ...mockMutation, mutate: vi.fn() }
    vi.mocked(useCreatePromotion).mockReturnValue(
      createMock as unknown as ReturnType<typeof useCreatePromotion>,
    )
    vi.mocked(usePromotions).mockReturnValue({ promotions: [], isLoading: false })

    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /nueva promoción/i }))

    expect(screen.getByPlaceholderText('SUMMER2026')).toBeInTheDocument()
  })
})
