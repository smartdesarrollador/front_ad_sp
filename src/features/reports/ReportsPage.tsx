import { lazy, Suspense } from 'react'
import FeatureGate from '@/components/shared/FeatureGate'
import { useSummary } from './hooks/useSummary'
import { useUsageReport } from './hooks/useUsageReport'
import { KpiCards } from './components/KpiCards'
import { UsageTrendsChart } from './components/UsageTrendsChart'
import { ExportButton } from './components/ExportButton'

// Lazy-load the heavy Recharts distribution chart; UsageTrendsChart stays eager
// because existing tests assert synchronously on its FeatureGate content.
const RoleDistributionChart = lazy(() =>
  import('./components/RoleDistributionChart').then((m) => ({ default: m.RoleDistributionChart })),
)

const ChartSkeleton = () => (
  <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
)

export default function ReportsPage() {
  const { summary, isLoading: loadingSummary } = useSummary()
  const { usage, isLoading: loadingUsage } = useUsageReport()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Métricas y estadísticas del sistema
        </p>
      </div>

      <FeatureGate feature="analytics">
        <KpiCards summary={summary} isLoading={loadingSummary} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Distribución de Roles
            </h3>
            <Suspense fallback={<ChartSkeleton />}>
              <RoleDistributionChart usage={usage} isLoading={loadingUsage} />
            </Suspense>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Tendencias de Uso
            </h3>
            <UsageTrendsChart />
          </div>
        </div>

        {/* Export */}
        <div className="flex justify-end">
          <ExportButton />
        </div>
      </FeatureGate>
    </div>
  )
}
