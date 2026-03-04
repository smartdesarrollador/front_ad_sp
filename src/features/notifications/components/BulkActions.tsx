import { CheckCheck } from 'lucide-react'
import { useMarkAllAsRead } from '../hooks/useMarkAllAsRead'

interface BulkActionsProps {
  unreadCount: number
}

export function BulkActions({ unreadCount }: BulkActionsProps) {
  const markAllAsRead = useMarkAllAsRead()

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : ''}
      </span>
      {unreadCount > 0 && (
        <button
          onClick={() => markAllAsRead.mutate()}
          disabled={markAllAsRead.isPending}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50"
        >
          {markAllAsRead.isPending ? (
            <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
          Marcar todas como leídas
        </button>
      )}
    </div>
  )
}
