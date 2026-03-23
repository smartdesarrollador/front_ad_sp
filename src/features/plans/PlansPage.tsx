import { useState } from 'react'
import { Info } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useAdminPlans } from './hooks/useAdminPlans'
import { PlanCard } from './components/PlanCard'
import { PlanEditModal } from './components/PlanEditModal'
import type { AdminPlan } from './types'

function PlanCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4" />
        <div className="space-y-2 mt-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const { plans, isLoading } = useAdminPlans()
  const { hasPermission } = usePermissions()
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null)

  const canEdit = hasPermission('subscriptions.manage')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Planes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Edita precios y características de presentación de cada plan
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 p-4">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Los IDs de plan (<code className="font-mono">free</code>, <code className="font-mono">starter</code>,{' '}
          <code className="font-mono">professional</code>, <code className="font-mono">enterprise</code>) son{' '}
          <strong>inmutables</strong>. Solo se editan precios y características de presentación.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => <PlanCardSkeleton key={i} />)
          : plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                canEdit={canEdit}
                onEdit={setEditingPlan}
              />
            ))}
      </div>

      {/* Edit Modal */}
      <PlanEditModal
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
      />
    </div>
  )
}
