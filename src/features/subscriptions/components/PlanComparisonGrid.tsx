import type { BillingCycle, PlanData, PlanType } from '../types'
import { BillingCycleToggle } from './BillingCycleToggle'
import { PlanCard } from './PlanCard'

interface Props {
  plans: PlanData[]
  currentPlan: PlanType
  billingCycle: BillingCycle
  onBillingCycleChange: (v: BillingCycle) => void
  onUpgrade: (plan: PlanType) => void
  canUpgrade: boolean
}

export function PlanComparisonGrid({
  plans,
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
        {plans.map((plan) => (
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
