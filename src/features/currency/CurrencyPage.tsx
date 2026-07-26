import { useState } from 'react'
import { Info, Lock } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useAdminPlans } from '@/features/plans/hooks/useAdminPlans'
import { CurrencyRateForm } from './components/CurrencyRateForm'
import { DefaultCurrencyCard } from './components/DefaultCurrencyCard'
import { CurrencyStatusCard } from './components/CurrencyStatusCard'
import { PlanConversionTable } from './components/PlanConversionTable'
import { useCurrencyConfig } from './hooks/useCurrencyConfig'

function StatusCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 animate-pulse">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-3" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-56 mt-6" />
    </div>
  )
}

export default function CurrencyPage() {
  const { config, usdToPen, isLoading } = useCurrencyConfig()
  const { plans, isLoading: plansLoading } = useAdminPlans()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission('subscriptions.manage')

  // Tasa que pinta la tabla: la que se está tecleando si es válida, la guardada si no.
  // Así el impacto se ve antes incluso de abrir la confirmación.
  const [draftRate, setDraftRate] = useState<number | null>(null)
  const previewRate = draftRate ?? usdToPen
  const isDraft = draftRate !== null && draftRate !== usdToPen

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Moneda</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tipo de cambio con el que se muestran los precios en soles
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          El dólar es la moneda base: todos los precios se <strong>cobran en USD</strong>. El tipo
          de cambio decide cómo se muestran los importes en soles y, en los pagos por Yape,{' '}
          <strong>queda registrado junto al comprobante</strong> para que el importe transferido
          siga cuadrando aunque la tasa cambie después.
        </p>
      </div>

      {isLoading || !config ? <StatusCardSkeleton /> : <CurrencyStatusCard config={config} />}

      {config && <DefaultCurrencyCard config={config} canEdit={canEdit} />}

      {config &&
        (canEdit ? (
          <CurrencyRateForm
            config={config}
            plans={plans}
            plansFailed={!plansLoading && plans.length === 0}
            onRateDraft={setDraftRate}
          />
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Necesitas el permiso <code>subscriptions.manage</code> para editar el tipo de
              cambio.
            </p>
          </div>
        ))}

      <PlanConversionTable
        plans={plans}
        rate={previewRate}
        isLoading={plansLoading}
        isDraft={isDraft}
      />
    </div>
  )
}
