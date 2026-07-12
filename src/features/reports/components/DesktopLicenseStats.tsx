import type { DesktopLicenseFunnelData } from '../types'

interface Props {
  desktopFunnel: DesktopLicenseFunnelData | undefined
  isLoading: boolean
}

function StatCard({
  title,
  value,
  subtitle,
  colorClass,
}: {
  title: string
  value: string
  subtitle: string
  colorClass: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colorClass} mb-3`} />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}

export function DesktopLicenseStats({ desktopFunnel, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-32 rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (!desktopFunnel) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Enviadas"
        value={String(desktopFunnel.sent)}
        subtitle={`de ${desktopFunnel.total} licencias`}
        colorClass="bg-blue-500"
      />
      <StatCard
        title="Activadas"
        value={String(desktopFunnel.activated)}
        subtitle={`${desktopFunnel.activation_rate}% de enviadas`}
        colorClass="bg-green-500"
      />
      <StatCard
        title="Pendientes"
        value={String(desktopFunnel.pending)}
        subtitle="sin activar aún"
        colorClass="bg-orange-500"
      />
      <StatCard
        title="Revocadas"
        value={String(desktopFunnel.revoked)}
        subtitle="licencias revocadas"
        colorClass="bg-gray-500"
      />
    </div>
  )
}
