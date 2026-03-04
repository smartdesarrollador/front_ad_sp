import {
  Bell,
  Shield,
  ShieldOff,
  Users,
  UserPlus,
  CreditCard,
  FileText,
  Settings,
  AlertTriangle,
  Zap,
  Lock,
  Mail,
  Key,
  Database,
  type LucideIcon,
} from 'lucide-react'
import type { AppNotification, NotificationCategory } from '../types'

export const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  ShieldOff,
  Users,
  UserPlus,
  CreditCard,
  FileText,
  Settings,
  AlertTriangle,
  Zap,
  Lock,
  Mail,
  Key,
  Database,
}

export const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  security: 'bg-red-100 text-red-600',
  users: 'bg-blue-100 text-blue-600',
  billing: 'bg-green-100 text-green-600',
  system: 'bg-gray-100 text-gray-600',
  roles: 'bg-purple-100 text-purple-600',
}

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return `Hace ${Math.floor(diff / 86400)} días`
}

interface NotificationItemProps {
  notification: AppNotification
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}

export function NotificationItem({ notification: n, onMarkRead, onDismiss }: NotificationItemProps) {
  const Icon = ICON_MAP[n.icon] ?? Bell
  const colorClass = CATEGORY_COLORS[n.category]
  const borderClass = n.read ? 'border-gray-100' : 'border-primary-100'
  const bgClass = n.read ? 'bg-white' : 'bg-primary-50/30'

  return (
    <div
      className={`flex gap-3 p-4 border-b ${borderClass} ${bgClass} dark:bg-gray-800 dark:border-gray-700`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
            {!n.read && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                Nueva
              </span>
            )}
          </div>
          <button
            onClick={() => onDismiss(n.id)}
            aria-label="Descartar notificación"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>

        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(n.created_at)}</span>
          {!n.read && (
            <button
              onClick={() => onMarkRead(n.id)}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Marcar como leída
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
