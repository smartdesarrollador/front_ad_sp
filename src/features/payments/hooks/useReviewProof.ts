import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { PaymentProof, ProofStatus } from '../types'

interface ReviewInput {
  id: string
  status: ProofStatus
}

export function useReviewProof() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: ReviewInput) =>
      apiClient
        .patch<PaymentProof>(`/admin/payments/proofs/${id}/review/`, { status })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-proofs'] })
    },
  })
}
