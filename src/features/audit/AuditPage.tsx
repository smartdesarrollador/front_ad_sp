import { useState } from 'react'
import FeatureGate from '@/components/shared/FeatureGate'
import { useAuditLogs } from './hooks/useAuditLogs'
import { AuditFilters, EMPTY_FILTERS } from './components/AuditFilters'
import { AuditLogTable } from './components/AuditLogTable'
import { ExportAuditButton } from './components/ExportAuditButton'
import type { AuditLogFilters } from './types'

const INITIAL_FILTERS: AuditLogFilters = EMPTY_FILTERS

export default function AuditPage() {
  const [filters, setFilters] = useState<AuditLogFilters>(INITIAL_FILTERS)
  const { logs, data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useAuditLogs(filters)

  const total = data?.pages[0]?.pagination.total ?? 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Auditoría</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Registro inmutable de actividad del sistema
        </p>
      </div>

      <FeatureGate feature="audit_logs">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {total} eventos
          </span>
          <ExportAuditButton />
        </div>

        <AuditFilters
          filters={filters}
          onChange={setFilters}
          totalCount={isLoading ? undefined : total}
        />

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <AuditLogTable
            logs={logs}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        </div>
      </FeatureGate>
    </div>
  )
}
