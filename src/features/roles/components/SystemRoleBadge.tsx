import { Lock } from 'lucide-react'

export function SystemRoleBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
      <Lock className="h-3 w-3" />
      Sistema
    </span>
  )
}
