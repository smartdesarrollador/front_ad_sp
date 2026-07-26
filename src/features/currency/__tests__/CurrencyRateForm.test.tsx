import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CurrencyRateForm } from '../components/CurrencyRateForm'
import type { AdminPlan } from '@/features/plans/types'
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

const plans: AdminPlan[] = [
  {
    id: 'free',
    display_name: 'Free',
    description: '',
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
    description: '',
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

function renderForm(plansFailed = false) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={qc}>
      <CurrencyRateForm
        config={config}
        plans={plansFailed ? [] : plans}
        plansFailed={plansFailed}
        onRateDraft={vi.fn()}
      />
    </QueryClientProvider>,
  )
}

function setRate(value: string) {
  fireEvent.change(screen.getByLabelText(/Tipo de cambio/i), { target: { value } })
}

function save() {
  fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }))
}

describe('CurrencyRateForm — validación', () => {
  beforeEach(() => vi.clearAllMocks())

  it('bloquea el dedazo por orden de magnitud sin llamar al backend', async () => {
    renderForm()
    setRate('375')
    save()
    expect(await screen.findByText(/fuera del rango/)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('bloquea una tasa por debajo del mínimo', async () => {
    renderForm()
    setRate('0.5')
    save()
    expect(await screen.findByText(/fuera del rango/)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('bloquea más de 4 decimales, que es lo que admite el backend', async () => {
    renderForm()
    setRate('3.75001')
    save()
    expect(await screen.findByText(/hasta 4 decimales/)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('deshabilita el guardado mientras no haya cambios', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeDisabled()
  })
})

describe('CurrencyRateForm — confirmación de impacto', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no guarda al enviar: primero muestra el impacto sobre los precios', async () => {
    renderForm()
    setRate('3.9')
    save()

    const dialog = await screen.findByRole('dialog')
    // El antes y el después conviven en la misma línea ("Mensual: S/ 296 → S/ 308"),
    // así que se comprueba sobre el contenido completo del diálogo.
    expect(dialog).toHaveTextContent('S/ 296')
    expect(dialog).toHaveTextContent('S/ 308')
    expect(mutate).not.toHaveBeenCalled()
  })

  it('omite del impacto los planes sin precio', async () => {
    renderForm()
    setRate('3.9')
    save()

    const dialog = await screen.findByRole('dialog')
    // "S/ 0 → S/ 0" sería puro ruido.
    expect(within(dialog).queryByText('Free')).not.toBeInTheDocument()
    expect(within(dialog).getByText('Professional')).toBeInTheDocument()
  })

  it('guarda solo el tipo de cambio al confirmar', async () => {
    renderForm()
    setRate('3.9')
    save()
    fireEvent.click(await screen.findByRole('button', { name: /Confirmar y guardar/i }))

    expect(mutate).toHaveBeenCalledTimes(1)
    // Nunca `source`: el serializer no lo acepta y la vista lo fuerza a 'manual'.
    expect(mutate.mock.calls[0][0]).toEqual({ usd_to_pen: '3.9' })
  })

  it('cancelar cierra el diálogo sin guardar', async () => {
    renderForm()
    setRate('3.9')
    save()
    fireEvent.click(await screen.findByRole('button', { name: /Cancelar/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mutate).not.toHaveBeenCalled()
  })

  it('permite confirmar aunque no se hayan podido cargar los planes', async () => {
    renderForm(true)
    setRate('3.9')
    save()

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/No se pudieron cargar los planes/)).toBeInTheDocument()
    // Un fallo de lectura no debe bloquear una escritura legítima.
    expect(screen.getByRole('button', { name: /Confirmar y guardar/i })).toBeEnabled()
  })
})

describe('CurrencyRateForm — errores del backend', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lleva el error de rango del servidor al campo y conserva lo tecleado', async () => {
    const error = {
      response: {
        status: 400,
        data: {
          error: {
            code: 'invalid',
            message: 'usd_to_pen: El tipo de cambio está fuera del rango permitido.',
            details: { usd_to_pen: ['El tipo de cambio está fuera del rango permitido.'] },
          },
        },
      },
    }
    mutate.mockImplementation((_vars, opts) => opts?.onError?.(error))

    renderForm()
    setRate('19.9')
    save()
    fireEvent.click(await screen.findByRole('button', { name: /Confirmar y guardar/i }))

    expect(
      await screen.findByText('El tipo de cambio está fuera del rango permitido.'),
    ).toBeInTheDocument()
    // El diálogo se cierra: el motivo pertenece al campo.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByLabelText(/Tipo de cambio/i)).toHaveValue(19.9)
  })

  it('muestra un aviso general si el error no corresponde a un campo', async () => {
    mutate.mockImplementation((_vars, opts) =>
      opts?.onError?.({ response: { status: 500, data: {} } }),
    )

    renderForm()
    setRate('3.9')
    save()
    fireEvent.click(await screen.findByRole('button', { name: /Confirmar y guardar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /No se pudo guardar el tipo de cambio/,
    )
  })

  it('confirma el guardado en la interfaz', async () => {
    mutate.mockImplementation((_vars, opts) => opts?.onSuccess?.())

    renderForm()
    setRate('3.9')
    save()
    fireEvent.click(await screen.findByRole('button', { name: /Confirmar y guardar/i }))

    expect(await screen.findByText('Guardado')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
