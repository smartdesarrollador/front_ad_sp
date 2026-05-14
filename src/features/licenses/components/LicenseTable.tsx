import { Ban, RefreshCw } from 'lucide-react'
import type { DesktopAppLicense } from '../types'
import { LicenseStatusBadge } from './LicenseStatusBadge'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

interface LicenseTableProps {
  licenses: DesktopAppLicense[]
  isLoading: boolean
  onRevoke: (license: DesktopAppLicense) => void
  onReactivate: (license: DesktopAppLicense) => void
}

export function LicenseTable({ licenses, isLoading, onRevoke, onReactivate }: LicenseTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {['Usuario', 'Plan', 'License Key', 'Estado', 'Equipo', 'Activada', 'Acciones'].map(
              (col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400"
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!isLoading && licenses.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                No hay licencias registradas.
              </td>
            </tr>
          )}

          {!isLoading &&
            licenses.map((lic) => (
              <tr
                key={lic.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3">
                  <div className="text-gray-900 dark:text-white font-medium truncate max-w-[180px]">
                    {lic.user_email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                    {lic.tenant_name}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {PLAN_LABELS[lic.tenant_plan] ?? lic.tenant_plan}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {lic.license_key}
                </td>
                <td className="px-4 py-3">
                  <LicenseStatusBadge status={lic.status} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[100px]">
                  {lic.hardware_id ? `${lic.hardware_id.substring(0, 12)}…` : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {lic.activated_at
                    ? new Date(lic.activated_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {lic.is_active ? (
                      <button
                        onClick={() => onRevoke(lic)}
                        title="Revocar licencia"
                        aria-label={`Revocar licencia de ${lic.user_email}`}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <Ban className="h-4 w-4 text-red-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onReactivate(lic)}
                        title="Reactivar licencia"
                        aria-label={`Reactivar licencia de ${lic.user_email}`}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <RefreshCw className="h-4 w-4 text-green-500" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
