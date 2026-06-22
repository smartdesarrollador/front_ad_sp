import { X } from 'lucide-react'

import { useUpdateContactStatus } from '../hooks/useUpdateContactStatus'
import { ContactStatusBadge } from './ContactStatusBadge'
import type { ContactMessage, ContactStatus } from '../types'

interface Props {
  message: ContactMessage | null
  onClose: () => void
}

export function ContactDetailPanel({ message, onClose }: Props) {
  const updateStatus = useUpdateContactStatus()

  if (!message) return null

  function handleStatus(status: ContactStatus) {
    updateStatus.mutate({ id: message!.id, status })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {message.name}
            </h2>
            <ContactStatusBadge status={message.status} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm text-gray-900 dark:text-white break-all">{message.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Teléfono</p>
              <p className="text-sm text-gray-900 dark:text-white">{message.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Fecha</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(message.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">IP</p>
              <p className="text-xs text-gray-900 dark:text-white font-mono">{message.ip_address || '—'}</p>
            </div>
          </div>

          {/* Mensaje */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Mensaje</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {message.message}
            </p>
          </div>

          {/* Acciones */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-wrap gap-2">
            {message.status !== 'read' && (
              <button
                onClick={() => handleStatus('read')}
                disabled={updateStatus.isPending}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Marcar como leído
              </button>
            )}
            {message.status !== 'archived' && (
              <button
                onClick={() => handleStatus('archived')}
                disabled={updateStatus.isPending}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40 disabled:opacity-50 transition-colors"
              >
                Archivar
              </button>
            )}
            {message.status === 'archived' && (
              <button
                onClick={() => handleStatus('new')}
                disabled={updateStatus.isPending}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 disabled:opacity-50 transition-colors"
              >
                Restaurar
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cerrar panel
          </button>
        </div>
      </div>
    </>
  )
}
