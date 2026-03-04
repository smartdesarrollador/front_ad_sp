import type { AuditLogEntry } from '../types'

interface RecentAuditEventsProps {
  logs: AuditLogEntry[]
  isLoading: boolean
}

function isFailureAction(action: string): boolean {
  const lower = action.toLowerCase()
  return lower.includes('fail') || lower.includes('deny')
}

export function RecentAuditEvents({ logs, isLoading }: RecentAuditEventsProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Eventos de Auditoría Recientes
        </h2>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-start gap-3 px-6 py-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                </div>
              </li>
            ))
          : logs.map((log) => {
              const failure = isFailureAction(log.action)
              return (
                <li key={log.id} className="flex items-start gap-3 px-6 py-3">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      failure ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      <span className="font-medium">{log.user_name ?? log.user_email ?? 'Sistema'}</span>
                      {' — '}
                      <span className="text-gray-600 dark:text-gray-400">{log.action}</span>
                      {log.resource_type && (
                        <span className="text-gray-500 dark:text-gray-500">
                          {' '}({log.resource_type})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(log.created_at).toLocaleString('es-ES')}
                      {log.ip_address && ` · ${log.ip_address}`}
                    </p>
                  </div>
                </li>
              )
            })}
        {!isLoading && logs.length === 0 && (
          <li className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay eventos de auditoría recientes.
          </li>
        )}
      </ul>
    </div>
  )
}
