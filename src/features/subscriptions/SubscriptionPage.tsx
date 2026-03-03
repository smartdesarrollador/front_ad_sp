import { useState } from 'react'
import { Lock } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { useCurrentSubscription } from './hooks/useCurrentSubscription'
import { useUpgradeSubscription } from './hooks/useUpgradeSubscription'
import { useInvoices } from './hooks/useInvoices'
import { CurrentPlanCard } from './components/CurrentPlanCard'
import { UsageMeters } from './components/UsageMeters'
import { PlanComparisonGrid } from './components/PlanComparisonGrid'
import { UpgradePlanModal } from './components/UpgradePlanModal'
import { InvoicePreview } from './components/InvoicePreview'
import { PLANS } from './plans-data'
import type { BillingCycle, PlanType, UpgradeRequest } from './types'

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [upgradeTarget, setUpgradeTarget] = useState<PlanType | null>(null)

  const { subscription, isLoading } = useCurrentSubscription()
  const { invoices, isLoading: loadingInvoices } = useInvoices()
  const { mutate: upgradePlan, isPending: upgrading } = useUpgradeSubscription()

  const { canManageBilling, canUpgradePlan } = usePermissions()

  const targetPlanData = upgradeTarget ? PLANS.find((p) => p.id === upgradeTarget) ?? null : null

  const handleUpgradeRequest = (plan: PlanType) => {
    if (!canManageBilling) return
    setUpgradeTarget(plan)
  }

  const handleConfirmUpgrade = (req: UpgradeRequest) => {
    upgradePlan(req, {
      onSuccess: () => setUpgradeTarget(null),
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suscripcion</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Gestiona tu plan y facturacion
        </p>
      </div>

      {!canManageBilling && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 p-4">
          <Lock className="h-5 w-5 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Acceso limitado</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
              No tienes permisos para modificar la suscripcion. Solo puedes ver la informacion.
            </p>
          </div>
        </div>
      )}

      {/* Plan + Usage row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentPlanCard
          subscription={subscription}
          canManageBilling={canManageBilling}
          onChangePlan={() => {}}
        />
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Uso actual
          </h3>
          <UsageMeters usage={subscription?.usage} isLoading={isLoading} />
        </div>
      </div>

      {/* Plan comparison */}
      {subscription && (
        <PlanComparisonGrid
          currentPlan={subscription.plan}
          billingCycle={billingCycle}
          onBillingCycleChange={setBillingCycle}
          onUpgrade={handleUpgradeRequest}
          canUpgrade={canManageBilling && canUpgradePlan}
        />
      )}

      {/* Invoices */}
      <InvoicePreview invoices={invoices} isLoading={loadingInvoices} />

      {/* Upgrade modal */}
      <UpgradePlanModal
        targetPlan={targetPlanData}
        billingCycle={billingCycle}
        isOpen={upgradeTarget !== null}
        onClose={() => setUpgradeTarget(null)}
        onConfirm={handleConfirmUpgrade}
        isPending={upgrading}
      />
    </div>
  )
}
