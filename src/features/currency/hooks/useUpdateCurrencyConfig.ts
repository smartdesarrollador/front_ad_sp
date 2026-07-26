import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { CurrencyConfig, CurrencyConfigUpdate } from '../types'

export function useUpdateCurrencyConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CurrencyConfigUpdate) =>
      apiClient
        .patch<{ currency: CurrencyConfig }>('/admin/billing/currency/', data)
        .then((r) => r.data.currency),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currency-config'] })
      // El PATCH hace dual-write a YapeConfig.exchange_rate y /admin/yape/config/ lo
      // devuelve desde la misma fuente. Sin esta invalidación, Pagos Yape enseñaría la
      // tasa vieja hasta 60s (su staleTime).
      qc.invalidateQueries({ queryKey: ['yape-config'] })
      // NO se invalida ['admin-plans']: los precios en USD no cambian. La referencia en
      // soles es derivada en el cliente y se recalcula al invalidarse ['currency-config'].
    },
  })
}
