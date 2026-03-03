import { PLANS } from '../plans-data'
import type { BillingCycle, PlanType } from '../types'
import { BillingCycleToggle } from './BillingCycleToggle'
import { PlanCard } from './PlanCard'

interface Props {
  currentPlan: PlanType
  billingCycle: BillingCycle
  onBillingCycleChange: (v: BillingCycle) => void
  onUpgrade: (plan: PlanType) => void
  canUpgrade: boolean
}

export function PlanComparisonGrid({
  currentPlan,
  billingCycle,
  onBillingCycleChange,
  onUpgrade,
  canUpgrade,
}: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Planes disponibles</h3>
        <BillingCycleToggle value={billingCycle} onChange={onBillingCycleChange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            billingCycle={billingCycle}
            onSelect={onUpgrade}
            canUpgrade={canUpgrade}
          />
        ))}
      </div>
    </div>
  )
}
