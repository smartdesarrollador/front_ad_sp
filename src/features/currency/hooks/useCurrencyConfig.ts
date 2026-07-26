import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { parseRate } from '@/lib/currency'
import type { CurrencyConfig } from '../types'

/**
 * Configuración de moneda de la plataforma.
 *
 * La queryKey es compartida a propósito con Gestión de Planes y con Pagos Yape:
 * TanStack deduplica el GET y una sola invalidación tras guardar refresca las
 * tres superficies. Duplicar el hook daría dos cachés y dejaría la referencia en
 * soles de Planes mostrando la tasa vieja.
 */
export function useCurrencyConfig() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['currency-config'],
    queryFn: () =>
      apiClient
        .get<{ currency: CurrencyConfig }>('/admin/billing/currency/')
        .then((r) => r.data.currency),
    // Mismo TTL que la caché del backend (utils/currency.CURRENCY_CACHE_TTL = 300s):
    // pedirlo más a menudo no traería un valor más fresco.
    staleTime: 5 * 60 * 1000,
  })

  return {
    config: data ?? null,
    /** Ya parseado: ningún consumidor debería tocar el string de 4 decimales. */
    usdToPen: parseRate(data?.usd_to_pen),
    isLoading,
    isError,
  }
}
