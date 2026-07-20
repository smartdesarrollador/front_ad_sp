import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { YapeProofsTable } from '../components/YapeProofsTable'
import { useReviewYapeProof } from '../hooks/useReviewYapeProof'
import type { YapeProof } from '../types'

vi.mock('../hooks/useReviewYapeProof')

const baseProof: YapeProof = {
  id: 'proof-1',
  screenshot_url: '',
  plan: 'starter',
  amount: '15.20',
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

const noPromoProof: YapeProof = {
  ...baseProof,
  id: 'proof-2',
  amount: '19.00',
  promo: null,
  tenant_name: 'Beta Corp',
  tenant_email: 'owner@beta.com',
}

function renderTable(proofs: YapeProof[]) {
  return render(
    <YapeProofsTable
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

describe('YapeProofsTable — desglose de cupón', () => {
  beforeEach(() => {
    vi.mocked(useReviewYapeProof).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReviewYapeProof>)
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
