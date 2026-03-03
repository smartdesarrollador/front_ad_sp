import type { TicketComment } from '../types'

function relativeTime(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return `hace ${h} hora${h !== 1 ? 's' : ''}`
  }
  const d = Math.floor(diff / 86400)
  return `hace ${d} día${d !== 1 ? 's' : ''}`
}

interface CommentThreadProps {
  comments: TicketComment[]
  isLoading: boolean
}

export function CommentThread({ comments, isLoading }: CommentThreadProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
        Sin comentarios aún
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isAgent = comment.role === 'agent'
        const avatarClass = isAgent
          ? 'bg-blue-600 text-white'
          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'

        return (
          <div key={comment.id} className="flex gap-3">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarClass}`}
            >
              {comment.author.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.author}
                </span>
                {isAgent ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Agente
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    Cliente
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {relativeTime(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
