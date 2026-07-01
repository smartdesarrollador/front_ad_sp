import { useState } from 'react'
import { Pencil, Trash2, ExternalLink, Monitor, Smartphone, Globe } from 'lucide-react'
import type { CatalogItem, TargetApp } from '../types'

const APP_LABELS: Record<TargetApp, { label: string; Icon: React.ElementType }> = {
  desktop: { label: 'Desktop', Icon: Monitor },
  mobile:  { label: 'Mobile',  Icon: Smartphone },
  web:     { label: 'Web',     Icon: Globe },
}

interface CatalogItemCardProps {
  item: CatalogItem
  onEdit: (item: CatalogItem) => void
  onDelete: (id: string) => void
}

export function CatalogItemCard({ item, onEdit, onDelete }: CatalogItemCardProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: item.icon_color || '#6366f1' }} />

      <div className="p-4 space-y-3">
        {/* Top row: image/icon + badge + actions */}
        <div className="flex items-start gap-3">
          {/* Image or color fallback */}
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0"
              style={{ backgroundColor: item.icon_color || '#6366f1' }}
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {item.name}
              </h3>
              {item.badge_text && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded">
                  {item.badge_text}
                </span>
              )}
              <span
                className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                  item.is_active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {item.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {item.category && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                {item.category}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {item.short_description}
        </p>

        {/* Target apps chips */}
        {item.target_apps.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {item.target_apps.map((app) => {
              const { label, Icon } = APP_LABELS[app] ?? { label: app, Icon: Globe }
              return (
                <span
                  key={app}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              )
            })}
          </div>
        )}

        {/* Footer: link + actions */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
          {item.link_url ? (
            <a
              href={item.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Ver enlace
            </a>
          ) : (
            <span className="text-xs text-gray-400">Sin enlace</span>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(item)}
              aria-label="Editar"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {confirming ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onDelete(item.id); setConfirming(false) }}
                  className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                aria-label="Eliminar"
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
