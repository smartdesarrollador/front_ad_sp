import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { useAddComment } from '../hooks/useAddComment'

interface CommentInputProps {
  ticketId: string
  onCommentAdded?: () => void
  isAgent: boolean
}

export function CommentInput({ ticketId, onCommentAdded }: CommentInputProps) {
  const [message, setMessage] = useState('')
  const addComment = useAddComment()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    addComment.mutate(
      { ticket_id: ticketId, message },
      {
        onSuccess: () => {
          setMessage('')
          onCommentAdded?.()
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        rows={3}
        placeholder="Escribe un comentario..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!message.trim() || addComment.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addComment.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar
            </>
          )}
        </button>
      </div>
    </form>
  )
}
