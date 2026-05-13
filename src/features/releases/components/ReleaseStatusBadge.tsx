interface ReleaseStatusBadgeProps {
  isPublished: boolean
}

export function ReleaseStatusBadge({ isPublished }: ReleaseStatusBadgeProps) {
  if (isPublished) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Publicado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
      Borrador
    </span>
  )
}
