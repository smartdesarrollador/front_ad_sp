import { useState } from 'react'
import { BarChart3, Pencil, PauseCircle, PlayCircle, Trash2 } from 'lucide-react'
import type { Promotion, PromotionStatus } from '../types'

const PALETTE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280']

function getPromotionColor(code: string): string {
  return PALETTE[code.charCodeAt(0) % PALETTE.length]
}

export const STATUS_BADGE_CLASSES: Record<PromotionStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  expired: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  depleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export const STATUS_BADGE_LABELS: Record<PromotionStatus, string> = {
  active: 'Activa',
  paused: 'Pausada',
  expired: 'Expirada',
  depleted: 'Agotada',
}

export const TYPE_BADGE_LABELS: Record<Promotion['type'], string> = {
  percentage: '%',
  fixed_amount: '$',
  trial_extension: '+días',
}

export function formatValue(p: Promotion): string {
  if (p.type === 'percentage') return `${p.value}%`
  if (p.type === 'fixed_amount') return `$${p.value}`
  return `+${p.value} días`
}

function isExpiringSoon(expiresAt: string): boolean {
  const expires = new Date(expiresAt)
  const soon = new Date()
  soon.setDate(soon.getDate() + 7)
  return expires <= soon
}

interface PromotionCardProps {
  promotion: Promotion
  onEdit: (promotion: Promotion) => void
  onDelete: (id: string) => void
  onToggle: (promotion: Promotion) => void
  onViewStats: (promotion: Promotion) => void
  canUpdate: boolean
  canDelete: boolean
  canViewStats: boolean
}

export function PromotionCard({
  promotion,
  onEdit,
  onDelete,
  onToggle,
  onViewStats,
  canUpdate,
  canDelete,
  canViewStats,
}: PromotionCardProps) {
  const [confirming, setConfirming] = useState(false)
  const accentColor = getPromotionColor(promotion.code)

  const usagePercent =
    promotion.max_uses !== null
      ? Math.min(100, (promotion.current_uses / promotion.max_uses) * 100)
      : 0

  const barColor =
    usagePercent >= 90
      ? 'bg-red-500'
      : usagePercent >= 70
        ? 'bg-yellow-500'
        : 'bg-green-500'

  const canToggle =
    canUpdate && promotion.status !== 'expired' && promotion.status !== 'depleted'

  const cardOpacity =
    promotion.status === 'expired' || promotion.status === 'depleted'
      ? 'opacity-60'
      : promotion.status === 'paused'
        ? 'opacity-70'
        : ''

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex ${cardOpacity}`}
    >
      {/* Accent bar */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: accentColor }} />

      <div className="flex flex-col flex-1 p-5 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-mono text-sm font-bold uppercase text-gray-900 dark:text-white truncate">
              {promotion.code}
            </span>
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {TYPE_BADGE_LABELS[promotion.type]}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE_CLASSES[promotion.status]}`}
            >
              {STATUS_BADGE_LABELS[promotion.status]}
            </span>
          </div>
        </div>

        {/* Name */}
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-0.5">
          {promotion.name}
        </p>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
          {promotion.description || <span className="italic">Sin descripción</span>}
        </p>

        {/* Usage bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Usos</span>
            <span>
              {promotion.current_uses} / {promotion.max_uses !== null ? promotion.max_uses : '∞'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-2 rounded-full ${barColor}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* Expiry warning */}
        {promotion.status === 'active' && isExpiringSoon(promotion.expires_at) && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">Expira pronto</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 mt-1">
          {confirming ? (
            <>
              <span className="text-xs text-gray-600 dark:text-gray-300 mr-1">¿Confirmar?</span>
              <button
                onClick={() => {
                  setConfirming(false)
                  onDelete(promotion.id)
                }}
                className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              {canViewStats && (
                <button
                  onClick={() => onViewStats(promotion)}
                  title="Ver estadísticas"
                  className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              )}
              {canUpdate && (
                <button
                  onClick={() => onEdit(promotion)}
                  title="Editar promoción"
                  className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {canToggle && (
                <button
                  onClick={() => onToggle(promotion)}
                  title={promotion.status === 'active' ? 'Pausar' : 'Activar'}
                  className="p-1.5 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                >
                  {promotion.status === 'active' ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setConfirming(true)}
                  title="Eliminar promoción"
                  className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
