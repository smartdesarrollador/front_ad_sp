import type { Permission } from '@/features/roles/types'
import { RESOURCE_LABELS } from './PermissionFilters'

type ActionType = 'read' | 'create' | 'update' | 'delete' | 'other'

function getAction(codename: string): ActionType {
  if (/^view_|\.read$/.test(codename)) return 'read'
  if (/^add_|\.create$|\.invite$/.test(codename)) return 'create'
  if (/^change_|\.update$|\.edit$/.test(codename)) return 'update'
  if (/^delete_|\.delete$/.test(codename)) return 'delete'
  return 'other'
}

const ACTION_LABELS: Record<ActionType, string> = {
  read: 'Lectura',
  create: 'Creación',
  update: 'Edición',
  delete: 'Eliminación',
  other: 'Otro',
}

const ACTION_COLORS: Record<ActionType, string> = {
  read: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  create: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  update: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  other: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

interface PermissionRowProps {
  permission: Permission
}

export function PermissionRow({ permission }: PermissionRowProps) {
  const action = getAction(permission.codename)

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/40">
      {/* Codename */}
      <code className="text-xs font-mono text-gray-600 dark:text-gray-400 min-w-0 truncate flex-shrink-0 max-w-[200px]">
        {permission.codename}
      </code>

      {/* Name */}
      <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 min-w-0 truncate">
        {permission.name}
      </span>

      {/* Action badge */}
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${ACTION_COLORS[action]}`}
      >
        {ACTION_LABELS[action]}
      </span>

      {/* Resource badge */}
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 flex-shrink-0">
        {RESOURCE_LABELS[permission.resource] ?? permission.resource}
      </span>
    </div>
  )
}
