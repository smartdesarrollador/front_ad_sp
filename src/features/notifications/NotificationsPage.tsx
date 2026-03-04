import { useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from './hooks/useNotifications'
import { useMarkAsRead } from './hooks/useMarkAsRead'
import { BulkActions } from './components/BulkActions'
import { NotificationList } from './components/NotificationList'

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading } = useNotifications()
  const markAsRead = useMarkAsRead()
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const visibleNotifications = useMemo(
    () => notifications.filter((n) => !dismissedIds.has(n.id)),
    [notifications, dismissedIds],
  )

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]))
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Bulk actions */}
      <BulkActions unreadCount={unreadCount} />

      {/* Notification list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <NotificationList
          notifications={visibleNotifications}
          isLoading={isLoading}
          onMarkRead={(id) => markAsRead.mutate(id)}
          onDismiss={handleDismiss}
        />
      </div>
    </div>
  )
}
