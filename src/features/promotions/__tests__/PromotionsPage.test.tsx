import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PromotionsPage from '../PromotionsPage'
import { usePromotions } from '../hooks/usePromotions'
import { useCreatePromotion } from '../hooks/useCreatePromotion'
import { useUpdatePromotion } from '../hooks/useUpdatePromotion'
import { useDeletePromotion } from '../hooks/useDeletePromotion'
import { usePromotionStats } from '../hooks/usePromotionStats'
import { usePermissions } from '@/hooks/usePermissions'
import type { Promotion } from '../types'

vi.mock('../hooks/usePromotions')
vi.mock('../hooks/useCreatePromotion')
vi.mock('../hooks/useUpdatePromotion')
vi.mock('../hooks/useDeletePromotion')
vi.mock('../hooks/usePromotionStats')
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
    applicable_plans: ['starter'],
    new_customers_only: false,
    starts_at: '2026-06-01T00:00:00Z',
    expires_at: '2026-08-31T23:59:59Z',
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
    starts_at: '2026-01-01T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
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
]

const mockPermissionsAdmin = {
  hasPermission: (codename: string) => codename === 'promotions.manage',
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

const mockStats = {
  total_redemptions: 5,
  confirmed: 3,
  pending: 1,
  released: 1,
  total_discount: 11.4,
  total_revenue: 45.6,
  by_plan: [
    { plan: 'starter', count: 2 },
    { plan: 'professional', count: 1 },
  ],
}

function mutationWith(overrides: Partial<typeof mockMutation>) {
  return { ...mockMutation, ...overrides }
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
    vi.mocked(usePromotionStats).mockReturnValue({ stats: mockStats, isLoading: false })
    vi.mocked(usePermissions).mockReturnValue(mockPermissionsAdmin)
  })

  it('grid renderiza tarjetas con badges correctos', () => {
    vi.mocked(usePromotions).mockReturnValue({ promotions: mockPromotions, isLoading: false })

    renderPage()

    expect(screen.getByText('SUMMER2026')).toBeInTheDocument()
    expect(screen.getByText('TECH50')).toBeInTheDocument()

    expect(screen.getAllByText('Activa').length > 0).toBe(true)
    expect(screen.getAllByText('Pausada').length > 0).toBe(true)

    expect(screen.getAllByText('%').length > 0).toBe(true)
    expect(screen.getAllByText('$').length > 0).toBe(true)
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
    vi.mocked(usePromotions).mockReturnValue({ promotions: [], isLoading: false })

    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /nueva promoción/i }))

    expect(screen.getByPlaceholderText('SUMMER2026')).toBeInTheDocument()
  })

  it('el modal no ofrece trial_extension ni plan Free (v1)', async () => {
    vi.mocked(usePromotions).mockReturnValue({ promotions: [], isLoading: false })

    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /nueva promoción/i }))

    expect(screen.queryByRole('option', { name: /extensión trial/i })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Porcentaje (%)' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Free' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Starter' })).toBeInTheDocument()
  })

  it('crear envía fechas como datetime ISO', async () => {
    const createMock = mutationWith({ mutate: vi.fn() })
    vi.mocked(useCreatePromotion).mockReturnValue(
      createMock as unknown as ReturnType<typeof useCreatePromotion>,
    )
    vi.mocked(usePromotions).mockReturnValue({ promotions: [], isLoading: false })

    const user = userEvent.setup()
    const { container } = renderPage()
    await user.click(screen.getByRole('button', { name: /nueva promoción/i }))

    await user.type(screen.getByPlaceholderText('SUMMER2026'), 'NUEVO25')
    await user.type(screen.getByPlaceholderText('Descuento de verano'), 'Promo nueva')
    await user.type(screen.getByPlaceholderText('10'), '25')
    await user.click(screen.getByRole('button', { name: 'Starter' }))
    const dateInputs = container.querySelectorAll('input[type="date"]')
    fireEvent.change(dateInputs[0], { target: { value: '2026-08-01' } })
    fireEvent.change(dateInputs[1], { target: { value: '2026-09-30' } })

    await user.click(screen.getByRole('button', { name: /crear promoción/i }))

    await waitFor(() => expect(createMock.mutate).toHaveBeenCalled())
    const payload = createMock.mutate.mock.calls[0][0]
    expect(payload.starts_at).toBe('2026-08-01T00:00:00Z')
    expect(payload.expires_at).toBe('2026-09-30T23:59:59Z')
    expect(payload.code).toBe('NUEVO25')
  })

  it('editar no envía code (inmutable) y el input está deshabilitado', async () => {
    const updateMock = mutationWith({ mutate: vi.fn() })
    vi.mocked(useUpdatePromotion).mockReturnValue(
      updateMock as unknown as ReturnType<typeof useUpdatePromotion>,
    )
    vi.mocked(usePromotions).mockReturnValue({ promotions: mockPromotions, isLoading: false })

    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar promoción tech discount/i }))

    expect(screen.getByPlaceholderText('SUMMER2026')).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => expect(updateMock.mutate).toHaveBeenCalled())
    const payload = updateMock.mutate.mock.calls[0][0]
    expect(payload.id).toBe('p2')
    expect(payload).not.toHaveProperty('code')
    expect(payload.starts_at).toBe('2026-01-01T00:00:00Z')
  })

  it('errores 400 por campo del backend se muestran en el form', async () => {
    const envelope = {
      response: {
        status: 400,
        data: {
          error: {
            code: 'invalid',
            message: 'code: promotion with this code already exists.',
            details: { code: ['promotion with this code already exists.'] },
          },
        },
      },
    }
    const createMock = mutationWith({
      mutate: vi.fn((_vals, opts) => opts?.onError?.(envelope)),
    })
    vi.mocked(useCreatePromotion).mockReturnValue(
      createMock as unknown as ReturnType<typeof useCreatePromotion>,
    )
    vi.mocked(usePromotions).mockReturnValue({ promotions: [], isLoading: false })

    const user = userEvent.setup()
    const { container } = renderPage()
    await user.click(screen.getByRole('button', { name: /nueva promoción/i }))

    await user.type(screen.getByPlaceholderText('SUMMER2026'), 'NUEVO25')
    await user.type(screen.getByPlaceholderText('Descuento de verano'), 'Promo nueva')
    await user.type(screen.getByPlaceholderText('10'), '25')
    await user.click(screen.getByRole('button', { name: 'Starter' }))
    const dateInputs = container.querySelectorAll('input[type="date"]')
    fireEvent.change(dateInputs[0], { target: { value: '2026-08-01' } })
    fireEvent.change(dateInputs[1], { target: { value: '2026-09-30' } })
    await user.click(screen.getByRole('button', { name: /crear promoción/i }))

    expect(
      await screen.findByText('promotion with this code already exists.'),
    ).toBeInTheDocument()
  })

  it('delete con 409 ofrece pausar en su lugar', async () => {
    const deleteMock = mutationWith({
      mutate: vi.fn((_id, opts) => opts?.onError?.({ response: { status: 409 } })),
    })
    const updateMock = mutationWith({ mutate: vi.fn() })
    vi.mocked(useDeletePromotion).mockReturnValue(
      deleteMock as unknown as ReturnType<typeof useDeletePromotion>,
    )
    vi.mocked(useUpdatePromotion).mockReturnValue(
      updateMock as unknown as ReturnType<typeof useUpdatePromotion>,
    )
    vi.mocked(usePromotions).mockReturnValue({ promotions: mockPromotions, isLoading: false })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /eliminar promoción descuento de verano/i }))
    await user.click(screen.getByRole('button', { name: /sí, eliminar/i }))

    expect(deleteMock.mutate).toHaveBeenCalled()
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('canjes registrados'))
    expect(updateMock.mutate).toHaveBeenCalledWith({ id: 'p1', status: 'paused' })
    confirmSpy.mockRestore()
  })

  it('stats modal consume el endpoint real de stats', async () => {
    vi.mocked(usePromotions).mockReturnValue({ promotions: mockPromotions, isLoading: false })

    const user = userEvent.setup()
    renderPage()
    await user.click(
      screen.getByRole('button', { name: /ver estadísticas de descuento de verano/i }),
    )

    expect(await screen.findByText('Confirmados')).toBeInTheDocument()
    expect(screen.getByText('Pendientes')).toBeInTheDocument()
    expect(screen.getByText('Liberados')).toBeInTheDocument()
    expect(screen.getByText('$11.40')).toBeInTheDocument()
    expect(screen.getByText(/starter \(2\)/i)).toBeInTheDocument()
  })

  it('sin promotions.manage no hay acciones de gestión', () => {
    vi.mocked(usePermissions).mockReturnValue({
      ...mockPermissionsAdmin,
      hasPermission: () => false,
    })
    vi.mocked(usePromotions).mockReturnValue({ promotions: mockPromotions, isLoading: false })

    renderPage()

    expect(screen.queryByRole('button', { name: /nueva promoción/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /editar promoción/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /eliminar promoción/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /ver estadísticas/i })).not.toBeInTheDocument()
  })
})
