import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { PaymentMethodCard } from '../components/PaymentMethodCard'
import type { PaymentMethodConfig } from '../types'

const state = vi.hoisted(() => ({
  mutate: vi.fn(),
}))

vi.mock('../hooks/useUpdatePaymentMethod', () => ({
  useUpdatePaymentMethod: () => ({ mutate: state.mutate, isPending: false }),
}))

vi.mock('@/features/currency/hooks/useCurrencyConfig', () => ({
  useCurrencyConfig: () => ({
    config: { usd_to_pen: '3.7500' },
    usdToPen: 3.75,
    isLoading: false,
    isError: false,
  }),
}))

const yapeConfig: PaymentMethodConfig = {
  method: 'yape',
  display_name: 'Yape',
  is_enabled: true,
  is_configured: true,
  sort_order: 1,
  holder_name: 'Juan Pérez',
  phone: '955365043',
  checkout_url: '',
  account_email: '',
  instructions_note: '',
  updated_at: '2026-07-25T00:00:00Z',
}

const paypalConfig: PaymentMethodConfig = {
  method: 'paypal',
  display_name: 'PayPal',
  is_enabled: false,
  is_configured: false,
  sort_order: 2,
  holder_name: '',
  phone: '',
  checkout_url: '',
  account_email: '',
  instructions_note: '',
  updated_at: null,
}

function renderCard(config: PaymentMethodConfig, canManage = true) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [{ path: '/', element: <PaymentMethodCard config={config} canManage={canManage} /> }],
    { initialEntries: ['/'] },
  )
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('PaymentMethodCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pinta los campos de Yape y ninguno de PayPal', () => {
    renderCard(yapeConfig)

    expect(screen.getByLabelText('Número Yape')).toHaveValue('955365043')
    expect(screen.getByLabelText('Titular de la cuenta')).toBeInTheDocument()
    expect(screen.queryByLabelText('Enlace de pago')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Correo de la cuenta')).not.toBeInTheDocument()
  })

  it('pinta los campos de PayPal y ninguno de Yape', () => {
    renderCard(paypalConfig)

    expect(screen.getByLabelText('Enlace de pago')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo de la cuenta')).toBeInTheDocument()
    expect(screen.queryByLabelText('Número Yape')).not.toBeInTheDocument()
  })

  it('avisa cuando falta el dato de destino del pago', () => {
    renderCard(paypalConfig)
    expect(screen.getByText('Falta el dato de destino del pago')).toBeInTheDocument()
  })

  it('envía solo los campos tocados, no la ficha entera', async () => {
    // Un PATCH con todo el formulario pisaría con '' campos que este método ni
    // siquiera muestra.
    const user = userEvent.setup()
    renderCard(paypalConfig)

    await user.type(screen.getByLabelText('Enlace de pago'), 'https://paypal.me/acme')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(state.mutate).toHaveBeenCalled())
    expect(state.mutate.mock.calls[0][0]).toEqual({
      method: 'paypal',
      data: { checkout_url: 'https://paypal.me/acme' },
    })
  })

  it('muestra junto al interruptor el motivo por el que el backend rechaza habilitar', async () => {
    // Sin esto el fallo sería MUDO: el admin pulsa habilitar, el backend lo rechaza
    // con un motivo claro y el usuario solo ve el botón girar (LL-110).
    const motivo =
      'No se puede habilitar PayPal sin un enlace de pago o un correo de la cuenta: ' +
      'el cliente llegaría al paso de pago sin saber a dónde pagar.'
    state.mutate.mockImplementation((_vars, opts) => {
      opts.onError({ response: { data: { error: { details: { is_enabled: [motivo] } } } } })
    })

    const user = userEvent.setup()
    renderCard(paypalConfig)

    await user.click(screen.getByRole('switch'))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText(motivo)).toBeInTheDocument()
  })

  it('sin permiso, los campos quedan deshabilitados y no hay botón de guardar', () => {
    renderCard(yapeConfig, false)

    expect(screen.getByLabelText('Número Yape')).toBeDisabled()
    expect(screen.getByRole('switch')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument()
  })

  it('muestra el tipo de cambio en solo lectura, con enlace a Moneda', () => {
    // La tasa se edita en /currency: dos campos editables del mismo número divergen.
    renderCard(yapeConfig)

    expect(screen.getByText('3.7500 soles por dólar')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Se edita en Moneda' })).toHaveAttribute(
      'href', '/currency',
    )
  })
})
