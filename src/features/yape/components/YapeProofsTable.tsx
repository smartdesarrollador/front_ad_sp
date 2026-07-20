import { CheckCircle, XCircle } from 'lucide-react'
import type { YapeProof } from '../types'
import { useReviewYapeProof } from '../hooks/useReviewYapeProof'

const STATUS_CONFIG = {
  pending:  { label: 'Pendiente',  classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  approved: { label: 'Aprobado',   classes: 'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300'  },
  rejected: { label: 'Rechazado',  classes: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300'    },
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

interface Props {
  proofs: YapeProof[]
  isLoading: boolean
  page: number
  totalPages: number
  total: number
  perPage: number
  onPageChange: (p: number) => void
  onThumbnailClick: (proof: YapeProof) => void
}

export function YapeProofsTable({
  proofs, isLoading, page, totalPages, total, perPage, onPageChange, onThumbnailClick,
}: Props) {
  const review = useReviewYapeProof()

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {['Comprobante', 'Cliente', 'Plan', 'Monto', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                </tr>
              ))
            ) : proofs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  No hay comprobantes que mostrar
                </td>
              </tr>
            ) : (
              proofs.map((proof) => {
                const sc = STATUS_CONFIG[proof.status]
                return (
                  <tr key={proof.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      {proof.screenshot_url ? (
                        <img
                          src={proof.screenshot_url}
                          alt="Comprobante"
                          onClick={() => onThumbnailClick(proof)}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{proof.tenant_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{proof.tenant_email}</p>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {PLAN_LABELS[proof.plan] ?? proof.plan}
                      </span>
                    </td>

                    {/* Monto */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        ${proof.amount}
                      </span>
                      {proof.promo && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono text-gray-400 line-through">
                            ${proof.promo.original_amount}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            {proof.promo.code}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.classes}`}>
                        {sc.label}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(proof.created_at)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      {proof.status === 'pending' ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => review.mutate({ id: proof.id, status: 'approved' })}
                            disabled={review.isPending}
                            title="Aprobar"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => review.mutate({ id: proof.id, status: 'rejected' })}
                            disabled={review.isPending}
                            title="Rechazar"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {proof.reviewed_at ? formatDate(proof.reviewed_at) : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > perPage && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
