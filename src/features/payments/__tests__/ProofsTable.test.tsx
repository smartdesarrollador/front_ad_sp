import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProofsTable } from '../components/ProofsTable'
import { useReviewProof } from '../hooks/useReviewProof'
import type { PaymentProof } from '../types'

vi.mock('../hooks/useReviewProof')

const baseProof: PaymentProof = {
  id: 'proof-1',
  method: 'yape',
  charge_currency: 'PEN',
  transaction_reference: '',
  screenshot_url: '',
  plan: 'starter',
  billing_cycle: 'monthly',
  amount: '15.20',
  exchange_rate: '3.7500',
  amount_pen: '57.00',
  promo: {
    code: 'VERANO20',
    original_amount: '19.00',
    discount_amount: '3.80',
    final_amount: '15.20',
  },
  status: 'pending',
  tenant_name: 'Acme',
  tenant_email: 'owner@acme.com',
  tenant_slug: 'acme',
  created_at: '2026-07-19T10:00:00Z',
  reviewed_at: null,
}

const noPromoProof: PaymentProof = {
  ...baseProof,
  id: 'proof-2',
  amount: '19.00',
  promo: null,
  tenant_name: 'Beta Corp',
  tenant_email: 'owner@beta.com',
}

function renderTable(proofs: PaymentProof[]) {
  return render(
    <ProofsTable
      proofs={proofs}
      isLoading={false}
      page={1}
      totalPages={1}
      total={proofs.length}
      perPage={5}
      onPageChange={() => {}}
      onThumbnailClick={() => {}}
    />,
  )
}

describe('ProofsTable — desglose de cupón', () => {
  beforeEach(() => {
    vi.mocked(useReviewProof).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReviewProof>)
  })

  it('muestra código del cupón y precio original tachado cuando hay promo', () => {
    renderTable([baseProof])

    expect(screen.getByText('$15.20')).toBeInTheDocument()
    expect(screen.getByText('VERANO20')).toBeInTheDocument()
    const original = screen.getByText('$19.00')
    expect(original.className).toContain('line-through')
  })

  it('no muestra badge de cupón cuando promo es null', () => {
    renderTable([noPromoProof])

    expect(screen.getByText('$19.00')).toBeInTheDocument()
    expect(screen.queryByText('VERANO20')).not.toBeInTheDocument()
    expect(document.querySelector('.line-through')).toBeNull()
  })
})

describe('ProofsTable — ciclo de facturación', () => {
  beforeEach(() => {
    vi.mocked(useReviewProof).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReviewProof>)
  })

  it('marca los comprobantes anuales y sufija el monto con /año', () => {
    // Sin esto, quien revisa ve "$854" en un plan de $79/mes y no puede saber si es
    // un pago anual legítimo o un importe anómalo — y aprobarlo concede 365 días.
    renderTable([
      { ...noPromoProof, plan: 'professional', billing_cycle: 'annual', amount: '854.00' },
    ])

    expect(screen.getByText('Anual')).toBeInTheDocument()
    expect(screen.getByText('$854.00')).toBeInTheDocument()
    expect(screen.getByText('/año')).toBeInTheDocument()
  })

  it('marca los mensuales como tales (el silencio era la ambigüedad)', () => {
    renderTable([noPromoProof])

    expect(screen.getByText('Mensual')).toBeInTheDocument()
    expect(screen.getByText('/mes')).toBeInTheDocument()
    expect(screen.queryByText('Anual')).not.toBeInTheDocument()
  })

  it('muestra los soles transferidos con la tasa registrada en el pago', () => {
    // El componente NO consulta la tasa vigente: si lo hiciera, este test no
    // podría pasar sin montar el hook de moneda.
    renderTable([{ ...noPromoProof, amount_pen: '746.25', exchange_rate: '3.7500' }])

    expect(screen.getByText(/S\/ 746\.25/)).toBeInTheDocument()
    expect(screen.getByText(/tasa 3\.7500/)).toBeInTheDocument()
  })

  it('avisa cuando el comprobante no trae conversión, en vez de inventarla', () => {
    renderTable([{ ...noPromoProof, amount_pen: null, exchange_rate: null }])

    expect(screen.getByText('Sin conversión registrada')).toBeInTheDocument()
    expect(screen.queryByText(/S\//)).not.toBeInTheDocument()
  })
})

describe('ProofsTable — método de pago', () => {
  beforeEach(() => {
    vi.mocked(useReviewProof).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReviewProof>)
  })

  it('muestra el método de cada comprobante', () => {
    renderTable([noPromoProof])

    expect(screen.getByText('Yape')).toBeInTheDocument()
  })

  it('distingue un pago de PayPal de uno de Yape en la misma cola', () => {
    // La cola es única para todos los métodos: sin esta columna, el revisor no sabría
    // en qué panel buscar el pago que tiene delante.
    renderTable([
      noPromoProof,
      {
        ...noPromoProof, id: 'proof-3', method: 'paypal', charge_currency: 'USD',
        transaction_reference: '8XY12345AB',
      },
    ])

    expect(screen.getByText('Yape')).toBeInTheDocument()
    expect(screen.getByText('PayPal')).toBeInTheDocument()
  })

  it('un pago en dólares no se explica como si le faltara la tasa', () => {
    // Los dos casos llegan con `amount_pen` a null y significan cosas distintas.
    renderTable([
      { ...noPromoProof, method: 'paypal', charge_currency: 'USD', amount_pen: null, exchange_rate: null },
    ])

    expect(screen.getByText('Pagado en dólares')).toBeInTheDocument()
    expect(screen.queryByText('Sin conversión registrada')).not.toBeInTheDocument()
  })
})
