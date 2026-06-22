import type { ContactStatus } from '../types'

const CONFIG: Record<ContactStatus, { label: string; className: string }> = {
  new: {
    label: 'Nuevo',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  read: {
    label: 'Leído',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  },
  archived: {
    label: 'Archivado',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
}

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
