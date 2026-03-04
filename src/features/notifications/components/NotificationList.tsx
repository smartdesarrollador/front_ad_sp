import { useState } from 'react'
import { Bell } from 'lucide-react'
import type { AppNotification, NotificationFilter } from '../types'
import { NotificationItem } from './NotificationItem'

export const FILTER_LABELS: Record<NotificationFilter, string> = {
  all: 'Todas',
  unread: 'Sin leer',
  security: 'Seguridad',
  users: 'Usuarios',
  billing: 'Facturación',
  system: 'Sistema',
  roles: 'Roles',
}

const FILTERS: NotificationFilter[] = ['all', 'unread', 'security', 'users', 'billing', 'system', 'roles']

interface NotificationListProps {
  notifications: AppNotification[]
  isLoading: boolean
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}

export function NotificationList({ notifications, isLoading, onMarkRead, onDismiss }: NotificationListProps) {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')

  const unreadCount = notifications.filter((n) => !n.read).length

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !n.read
    return n.category === activeFilter
  })

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100 dark:border-gray-700">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
              }`}
            >
              {FILTER_LABELS[filter]}
              {filter === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs rounded-full bg-red-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse bg-gray-100 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm">No hay notificaciones</p>
        </div>
      ) : (
        <div>
          {filtered.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={onMarkRead}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}
    </div>
  )
}
