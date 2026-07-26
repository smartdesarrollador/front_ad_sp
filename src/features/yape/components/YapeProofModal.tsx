import { useEffect } from 'react'
import { X, CheckCircle, XCircle, User, Calendar, Package, DollarSign } from 'lucide-react'
import { AMOUNT_DECIMALS, formatMoney } from '@/lib/currency'
import type { YapeProof } from '../types'
import { historicPen } from '../historic-pen'
import { useReviewYapeProof } from '../hooks/useReviewYapeProof'

const STATUS_CONFIG = {
  pending:  { label: 'Pendiente',  classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  approved: { label: 'Aprobado',   classes: 'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300'  },
  rejected: { label: 'Rechazado',  classes: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300'    },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

interface Props {
  proof: YapeProof | null
  onClose: () => void
}

export function YapeProofModal({ proof, onClose }: Props) {
  const review = useReviewYapeProof()
  const pen = historicPen(proof?.amount_pen ?? null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!proof) return null

  const sc = STATUS_CONFIG[proof.status]

  function handleReview(status: 'approved' | 'rejected') {
    if (!proof) return
    review.mutate({ id: proof.id, status }, { onSuccess: onClose })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image panel */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center min-h-[300px] md:min-h-0">
          {proof.screenshot_url ? (
            <img
              src={proof.screenshot_url}
              alt="Comprobante Yape"
              className="max-h-[80vh] max-w-full object-contain"
            />
          ) : (
            <div className="text-gray-500 text-sm">Sin imagen</div>
          )}
        </div>

        {/* Info panel */}
        <div className="w-full md:w-80 flex flex-col border-l border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Detalle del comprobante</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Status badge */}
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${sc.classes}`}>
              {sc.label}
            </span>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cliente</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{proof.tenant_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{proof.tenant_email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {proof.plan}
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium normal-case ${
                        proof.billing_cycle === 'annual'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {proof.billing_cycle === 'annual' ? 'Anual' : 'Mensual'}
                    </span>
                  </p>
                  {/* Lo que el clic de aprobar concede realmente. */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Activa {proof.billing_cycle === 'annual' ? '365' : '30'} días
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monto</p>

                  {/* Los soles van primero: es el número que aparece en el
                      screenshot que el revisor tiene delante. El dólar queda como
                      referencia de lo que se cobra. */}
                  {pen !== null ? (
                    <>
                      <p className="text-lg font-semibold font-mono text-gray-900 dark:text-white">
                        {formatMoney(pen, 'PEN', AMOUNT_DECIMALS)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${proof.amount} USD · tasa {proof.exchange_rate} al momento del pago
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium font-mono text-gray-900 dark:text-white">
                        ${proof.amount} USD
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Sin conversión registrada — comprobante anterior al registro de tasa
                      </p>
                    </>
                  )}

                  {/* El desglose del cupón se queda en USD: es la aritmética del
                      descuento, y lo que se compara contra el comprobante es el
                      total en soles de arriba. */}
                  {proof.promo && (
                    <div className="text-sm font-mono space-y-0.5 mt-1.5">
                      <p className="text-gray-500 dark:text-gray-400">
                        Plan: ${proof.promo.original_amount}
                      </p>
                      <p className="text-purple-600 dark:text-purple-400">
                        Cupón {proof.promo.code}: −${proof.promo.discount_amount}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Total: ${proof.promo.final_amount} USD
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enviado</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(proof.created_at)}</p>
                </div>
              </div>

              {proof.reviewed_at && (
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Revisado</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(proof.reviewed_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {proof.status === 'pending' && (
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <button
                type="button"
                onClick={() => handleReview('approved')}
                disabled={review.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {review.isPending ? 'Procesando...' : 'Aprobar cuenta'}
              </button>
              <button
                type="button"
                onClick={() => handleReview('rejected')}
                disabled={review.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Rechazar pago
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
