import { useState } from 'react'
import { ExternalLink, PauseCircle, Pencil, PlayCircle, Trash2 } from 'lucide-react'
import type { Announcement, AnnouncementPlacement } from '../types'

export const PLACEMENT_BADGE_LABELS: Record<AnnouncementPlacement, string> = {
  home: 'Home',
  dashboard: 'Dashboard',
  both: 'Home + Dashboard',
}

interface AnnouncementCardProps {
  item: Announcement
  onEdit: (item: Announcement) => void
  onDelete: (id: string) => void
  onToggle: (item: Announcement) => void
}

export function AnnouncementCard({ item, onEdit, onDelete, onToggle }: AnnouncementCardProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 space-y-3">
        {/* Top row: image/placeholder + badges + title */}
        <div className="flex items-start gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-indigo-500" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {item.title}
              </h3>
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
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {PLACEMENT_BADGE_LABELS[item.placement]}
            </p>
          </div>
        </div>

        {/* Message */}
        {item.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.message}</p>
        )}

        {/* Schedule window */}
        {(item.starts_at || item.ends_at) && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {item.starts_at ? new Date(item.starts_at).toLocaleDateString() : 'Sin inicio'}
            {' → '}
            {item.ends_at ? new Date(item.ends_at).toLocaleDateString() : 'Sin fin'}
          </p>
        )}

        {/* Footer: CTA + actions */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
          {item.cta_url ? (
            <a
              href={item.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              {item.cta_text || 'Ver enlace'}
            </a>
          ) : (
            <span className="text-xs text-gray-400">Sin CTA</span>
          )}

          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onDelete(item.id)
                  setConfirming(false)
                }}
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
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(item)}
                title="Editar anuncio"
                aria-label={`Editar anuncio ${item.title}`}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggle(item)}
                title={item.is_active ? 'Desactivar' : 'Activar'}
                aria-label={item.is_active ? `Desactivar anuncio ${item.title}` : `Activar anuncio ${item.title}`}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
              >
                {item.is_active ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setConfirming(true)}
                title="Eliminar anuncio"
                aria-label={`Eliminar anuncio ${item.title}`}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
