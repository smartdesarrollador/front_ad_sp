import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { PromotionCreateRequest, Promotion } from '../types'

export function useCreatePromotion() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: PromotionCreateRequest) =>
      apiClient.post<Promotion>('/admin/promotions/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promotions'] })
    },
  })
}
