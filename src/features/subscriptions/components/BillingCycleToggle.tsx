import type { BillingCycle } from '../types'

interface Props {
  value: BillingCycle
  onChange: (v: BillingCycle) => void
}

export function BillingCycleToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-700">
      <button
        aria-pressed={value === 'monthly'}
        onClick={() => onChange('monthly')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          value === 'monthly'
            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Mensual
      </button>
      <button
        aria-pressed={value === 'annual'}
        onClick={() => onChange('annual')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          value === 'annual'
            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Anual
        <span className="text-xs rounded px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold">
          -10%
        </span>
      </button>
    </div>
  )
}
