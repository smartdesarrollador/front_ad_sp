import { useState } from 'react'
import { Download } from 'lucide-react'
import FeatureGate from '@/components/shared/FeatureGate'
import { apiClient } from '@/lib/api'

interface Props {
  className?: string
}

function ExportAuditButtonInner({ className }: Props) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const response = await apiClient.get('/admin/audit-logs/export/', { responseType: 'blob' })
      const url = URL.createObjectURL(response.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit-log.csv'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors ${className ?? ''}`}
    >
      <Download className="h-4 w-4" />
      {isExporting ? 'Exportando...' : 'Exportar CSV'}
    </button>
  )
}

function DisabledExportAuditButton({ className }: Props) {
  return (
    <div className="relative group">
      <button
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-medium cursor-not-allowed ${className ?? ''}`}
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </button>
      <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        Enterprise
      </span>
    </div>
  )
}

export function ExportAuditButton({ className }: Props) {
  return (
    <FeatureGate
      feature="audit_export"
      fallback={<DisabledExportAuditButton className={className} />}
    >
      <ExportAuditButtonInner className={className} />
    </FeatureGate>
  )
}
