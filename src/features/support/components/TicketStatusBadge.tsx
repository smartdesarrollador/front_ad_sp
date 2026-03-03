import type { TicketStatus } from '../types'

export const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  open: {
    label: 'Abierto',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  in_progress: {
    label: 'En Progreso',
    className:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  waiting_client: {
    label: 'Esperando Cliente',
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
  resolved: {
    label: 'Resuelto',
    className:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  closed: {
    label: 'Cerrado',
    className:
      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
}

interface TicketStatusBadgeProps {
  status: TicketStatus
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
