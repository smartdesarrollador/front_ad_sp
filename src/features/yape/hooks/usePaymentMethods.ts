import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { PaymentMethodConfig } from '../types'

interface PaymentMethodsResponse {
  methods: PaymentMethodConfig[]
}

/**
 * Todos los métodos de pago, **incluidos los apagados** — al revés que el endpoint
 * público del Hub: el admin necesita ver lo que aún no ha configurado para poder
 * configurarlo. El backend los devuelve ya ordenados por `sort_order`.
 */
export function usePaymentMethods() {
  const { data, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () =>
      apiClient.get<PaymentMethodsResponse>('/admin/payments/methods/').then((r) => r.data),
    staleTime: 60_000,
  })
  return { methods: data?.methods ?? [], isLoading }
}
