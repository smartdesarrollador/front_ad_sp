import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import type { DesktopRelease } from '../types'
import { ReleaseStatusBadge } from './ReleaseStatusBadge'

const PLATFORM_LABELS: Record<string, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
}

const APP_TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  tauri: { label: 'Tauri', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  sidebar: { label: 'Offline', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

interface ReleaseTableProps {
  releases: DesktopRelease[]
  isLoading: boolean
  onTogglePublish: (release: DesktopRelease) => void
  onEdit: (release: DesktopRelease) => void
  onDelete: (release: DesktopRelease) => void
}

export function ReleaseTable({
  releases,
  isLoading,
  onTogglePublish,
  onEdit,
  onDelete,
}: ReleaseTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {['Versión', 'App', 'Plataforma', 'Archivo', 'Tamaño', 'Estado', 'Descargas', 'Fecha', 'Acciones'].map(
              (col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400"
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

          {!isLoading && releases.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                No hay releases. Sube el primero con el botón de arriba.
              </td>
            </tr>
          )}

          {!isLoading &&
            releases.map((release) => (
              <tr
                key={release.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">
                  {release.version}
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const badge = APP_TYPE_BADGE[release.app_type]
                    return badge ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    ) : (
                      <span className="text-gray-500">{release.app_type}</span>
                    )
                  })()}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {PLATFORM_LABELS[release.platform] ?? release.platform}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={release.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[180px] block"
                    title={release.file_name}
                  >
                    {release.file_name}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {release.file_size_mb} MB
                </td>
                <td className="px-4 py-3">
                  <ReleaseStatusBadge isPublished={release.is_published} />
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {release.download_count.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(release.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTogglePublish(release)}
                      title={release.is_published ? 'Despublicar' : 'Publicar'}
                      aria-label={
                        release.is_published
                          ? `Despublicar ${release.version}`
                          : `Publicar ${release.version}`
                      }
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      {release.is_published ? (
                        <EyeOff className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-500" />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(release)}
                      title="Editar notas"
                      aria-label={`Editar notas de ${release.version}`}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(release)}
                      title="Eliminar"
                      aria-label={`Eliminar release ${release.version}`}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
