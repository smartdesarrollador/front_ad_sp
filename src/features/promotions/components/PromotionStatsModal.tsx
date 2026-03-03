import { X } from 'lucide-react'
import type { Promotion } from '../types'
import { formatValue, STATUS_BADGE_CLASSES, STATUS_BADGE_LABELS } from './PromotionCard'

interface PromotionStatsModalProps {
  promotion: Promotion | null
  onClose: () => void
}

export function PromotionStatsModal({ promotion, onClose }: PromotionStatsModalProps) {
  if (promotion === null) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-base font-bold uppercase text-gray-900 dark:text-white">
                {promotion.code}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatValue(promotion)}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE_CLASSES[promotion.status]}`}
              >
                {STATUS_BADGE_LABELS[promotion.status]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Total Usos
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {promotion.current_uses}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  Conversión
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {promotion.conversion_rate}%
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Ingresos Generados
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  ${promotion.total_revenue.toFixed(0)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                  Descuento Promedio
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  ${promotion.avg_discount_amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {promotion.description && (
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Descripción: </span>
                  <span className="text-gray-900 dark:text-white">{promotion.description}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tipo: </span>
                <span className="text-gray-900 dark:text-white capitalize">
                  {promotion.type.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Vigencia: </span>
                <span className="text-gray-900 dark:text-white">
                  {promotion.starts_at} → {promotion.expires_at}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Límites: </span>
                <span className="text-gray-900 dark:text-white">
                  {promotion.current_uses} / {promotion.max_uses ?? '∞'} usos
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Por cliente: </span>
                <span className="text-gray-900 dark:text-white">
                  {promotion.max_uses_per_customer}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Planes: </span>
                <span className="text-gray-900 dark:text-white">
                  {promotion.applicable_plans.length === 0
                    ? 'Todos'
                    : promotion.applicable_plans.join(', ')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Solo nuevos: </span>
                <span className="text-gray-900 dark:text-white">
                  {promotion.new_customers_only ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 dark:text-gray-400">Creado: </span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(promotion.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
