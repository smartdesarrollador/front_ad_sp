import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { PromotionUpdateRequest, Promotion } from '../types'

export function useUpdatePromotion() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: PromotionUpdateRequest) =>
      apiClient.patch<Promotion>(`/admin/promotions/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promotions'] })
    },
  })
}
