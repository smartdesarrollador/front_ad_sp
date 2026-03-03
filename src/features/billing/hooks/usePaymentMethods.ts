import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { PaymentMethod } from '../types'

interface PaymentMethodsResponse {
  methods: PaymentMethod[]
}

export function usePaymentMethods() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payment-methods'],
    queryFn: () =>
      apiClient.get<PaymentMethodsResponse>('/admin/billing/payment-methods/').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  return {
    methods: data?.methods ?? [],
    isLoading,
  }
}
