import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { PaymentMethod, PaymentMethodConfig, PaymentMethodConfigUpdate } from '../types'

interface UpdateVars {
  method: PaymentMethod
  data: PaymentMethodConfigUpdate
}

interface UpdateResponse {
  method: PaymentMethodConfig
}

/**
 * PATCH parcial de un método: se mandan solo los campos tocados.
 *
 * El backend puede responder 400 al habilitar un método sin su dato de destino
 * (teléfono en Yape, enlace o correo en PayPal). Ese error se pinta en la tarjeta, no
 * se traga aquí — un fallo mudo al pulsar el interruptor es justo lo que costó LL-110.
 */
export function useUpdatePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ method, data }: UpdateVars) =>
      apiClient
        .patch<UpdateResponse>(`/admin/payments/methods/${method}/`, data)
        .then((r) => r.data.method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })
}
