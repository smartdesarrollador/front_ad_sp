import type { LicenseStatus } from '../types'

const STATUS_CONFIG: Record<LicenseStatus, { label: string; cls: string }> = {
  active: {
    label: 'Activa',
    cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  pending: {
    label: 'Sin activar',
    cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  revoked: {
    label: 'Revocada',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
}

export { STATUS_CONFIG }

interface LicenseStatusBadgeProps {
  status: LicenseStatus
}

export function LicenseStatusBadge({ status }: LicenseStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}
