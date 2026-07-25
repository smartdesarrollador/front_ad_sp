import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PlanEditModal } from '../components/PlanEditModal'
import type { AdminPlan } from '../types'

const mutate = vi.fn()

vi.mock('../hooks/useUpdatePlan', () => ({
  useUpdatePlan: () => ({ mutate, isPending: false }),
}))

const starter: AdminPlan = {
  id: 'starter',
  display_name: 'Starter',
  description: 'Para pequeños equipos en crecimiento',
  price_monthly: 19,
  price_annual: 205,
  popular: false,
  highlights: [{ label: 'Hasta 9 usuarios', included: true }],
  limits: {
    max_users: 9,
    storage_gb: 5,
    max_projects: 10,
    max_custom_roles: 3,
    api_calls_per_month: 10000,
    max_image_upload_mb: 5,
    max_file_upload_mb: 10,
  },
  updated_at: '2026-07-25T00:00:00Z',
}

function renderModal(plan: AdminPlan = starter) {
  const onClose = vi.fn()
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={qc}>
      <PlanEditModal plan={plan} onClose={onClose} />
    </QueryClientProvider>,
  )
  return { onClose }
}

function setPrice(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function save() {
  fireEvent.click(screen.getByRole('button', { name: /Guardar/i }))
}

describe('PlanEditModal — guardarraíl del precio anual', () => {
  beforeEach(() => vi.clearAllMocks())

  it('bloquea un anual por encima de 12 mensualidades sin llamar al backend', async () => {
    renderModal()
    setPrice('Precio anual ($)', '313') // mensual 19 → 12 meses = 228

    save()

    await waitFor(() =>
      expect(screen.getByText(/no puede superar 12 mensualidades/)).toBeInTheDocument(),
    )
    expect(screen.getByText(/\$228/)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('permite guardar un anual con descuento', async () => {
    renderModal()
    setPrice('Precio anual ($)', '200')

    save()

    await waitFor(() => expect(mutate).toHaveBeenCalledOnce())
    const [payload] = mutate.mock.calls[0]
    expect(payload.id).toBe('starter')
    expect(payload.data.price_annual).toBe(200)
    expect(payload.data.price_monthly).toBe(19)
  })

  it('permite exactamente 12 mensualidades', async () => {
    renderModal()
    setPrice('Precio anual ($)', '228')

    save()

    await waitFor(() => expect(mutate).toHaveBeenCalledOnce())
  })
})

describe('PlanEditModal — pista de descuento', () => {
  beforeEach(() => vi.clearAllMocks())

  it('muestra el descuento y el ahorro del plan cargado', async () => {
    renderModal()
    await waitFor(() =>
      expect(screen.getByTestId('annual-discount-hint')).toHaveTextContent(
        '−10% · el cliente ahorra $23/año',
      ),
    )
  })

  it('se actualiza al teclear un anual distinto', async () => {
    renderModal()
    setPrice('Precio anual ($)', '114') // mitad de 228 → 50%

    await waitFor(() =>
      expect(screen.getByTestId('annual-discount-hint')).toHaveTextContent('−50%'),
    )
  })

  it('avisa cuando no hay descuento, con el equivalente de 12 meses', async () => {
    renderModal()
    setPrice('Precio anual ($)', '228')

    await waitFor(() =>
      expect(screen.getByTestId('annual-discount-hint')).toHaveTextContent(
        'Sin descuento anual (12 meses = $228)',
      ),
    )
  })
})

describe('PlanEditModal — errores del backend', () => {
  beforeEach(() => vi.clearAllMocks())

  function mutateRejects(error: unknown) {
    mutate.mockImplementation((_vars, opts) => opts?.onError?.(error))
  }

  it('pinta el error de campo del backend y NO cierra el modal', async () => {
    // Forma real verificada por HTTP: {"error": {"price_annual": ["..."]}}
    mutateRejects({
      response: {
        status: 400,
        data: { error: { price_annual: ['El precio anual ($999) no puede superar 12 mensualidades ($228).'] } },
      },
    })
    const { onClose } = renderModal()
    setPrice('Precio anual ($)', '200') // válido en cliente: el rechazo viene del servidor

    save()

    await waitFor(() =>
      expect(screen.getByText(/El precio anual \(\$999\)/)).toBeInTheDocument(),
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it('muestra un banner genérico ante un error sin forma de campo', async () => {
    mutateRejects({ response: { status: 500, data: {} } })
    const { onClose } = renderModal()
    setPrice('Precio anual ($)', '200')

    save()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar el plan'),
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it('usa el detail del backend cuando viene', async () => {
    mutateRejects({ response: { status: 403, data: { error: { detail: 'Sin permiso.' } } } })
    renderModal()
    setPrice('Precio anual ($)', '200')

    save()

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Sin permiso.'))
  })

  it('cierra el modal cuando el guardado tiene éxito', async () => {
    mutate.mockImplementation((_vars, opts) => opts?.onSuccess?.())
    const { onClose } = renderModal()
    setPrice('Precio anual ($)', '200')

    save()

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
  })
})
