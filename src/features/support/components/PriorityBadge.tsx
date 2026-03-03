import type { TicketPriority } from '../types'

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; className: string }> = {
  urgente: {
    label: 'Urgente',
    className:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  alta: {
    label: 'Alta',
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
  media: {
    label: 'Media',
    className:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  baja: {
    label: 'Baja',
    className:
      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
}

interface PriorityBadgeProps {
  priority: TicketPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
