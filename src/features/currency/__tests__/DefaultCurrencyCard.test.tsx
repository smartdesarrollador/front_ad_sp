import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DefaultCurrencyCard } from '../components/DefaultCurrencyCard'
import type { CurrencyConfig } from '../types'

const mutate = vi.fn()

vi.mock('../hooks/useUpdateCurrencyConfig', () => ({
  useUpdateCurrencyConfig: () => ({ mutate, isPending: false }),
}))

const config: CurrencyConfig = {
  usd_to_pen: '3.7500',
  default_display_currency: 'USD',
  source: 'manual',
  rates: { USD: '1.0000', PEN: '3.7500' },
  updated_at: '2026-07-26T03:03:08Z',
  updated_by_email: 'admin@rbac.local',
}

function renderCard(overrides: Partial<CurrencyConfig> = {}, canEdit = true) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={qc}>
      <DefaultCurrencyCard config={{ ...config, ...overrides }} canEdit={canEdit} />
    </QueryClientProvider>,
  )
}

describe('DefaultCurrencyCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('marca la moneda por defecto vigente', () => {
    renderCard()

    expect(screen.getByRole('button', { name: /Dólares/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Soles/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('guarda solo el campo que cambia', () => {
    renderCard()

    fireEvent.click(screen.getByRole('button', { name: /Soles/ }))

    expect(mutate).toHaveBeenCalledTimes(1)
    // Sin `usd_to_pen`: esta tarjeta no toca el tipo de cambio.
    expect(mutate.mock.calls[0][0]).toEqual({ default_display_currency: 'PEN' })
  })

  it('no envía nada al pulsar la moneda que ya está activa', () => {
    // Reenviarla dispararía el "debes enviar al menos un campo" del serializer.
    renderCard()

    fireEvent.click(screen.getByRole('button', { name: /Dólares/ }))

    expect(mutate).not.toHaveBeenCalled()
  })

  it('explica a quién afecta el cambio', () => {
    // Sin esto, un admin espera que cambie la moneda de todos sus clientes.
    renderCard()

    expect(screen.getByText(/todavía no ha elegido ninguna/)).toBeInTheDocument()
    expect(screen.getByText(/conservan su preferencia/)).toBeInTheDocument()
  })

  it('muestra el motivo si el backend rechaza el cambio', async () => {
    mutate.mockImplementation((_vars, opts) =>
      opts?.onError?.({ response: { status: 500, data: {} } }),
    )
    renderCard()

    fireEvent.click(screen.getByRole('button', { name: /Soles/ }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/No se pudo cambiar la moneda/),
    )
  })

  it('deshabilita la elección sin permiso de edición', () => {
    renderCard({}, false)

    expect(screen.getByRole('button', { name: /Soles/ })).toBeDisabled()
  })
})
