import type { Client } from '../types'

interface SuspendClientModalProps {
  client: Client | null
  onConfirm: () => void
  onClose: () => void
}

export function SuspendClientModal({ client, onConfirm, onClose }: SuspendClientModalProps) {
  if (!client) return null

  const isSuspending = client.is_active

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {isSuspending ? '¿Suspender cliente?' : '¿Activar cliente?'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {isSuspending
            ? `El tenant "${client.name}" perderá acceso a la plataforma.`
            : `El tenant "${client.name}" recuperará acceso a la plataforma.`}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
              isSuspending
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
