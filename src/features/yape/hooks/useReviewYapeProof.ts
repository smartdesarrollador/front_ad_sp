import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { YapeProof, YapeProofStatus } from '../types'

interface ReviewInput {
  id: string
  status: YapeProofStatus
}

export function useReviewYapeProof() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: ReviewInput) =>
      apiClient
        .patch<YapeProof>(`/admin/yape/proofs/${id}/review/`, { status })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['yape-proofs'] })
    },
  })
}
