import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { publicClient } from '@/lib/api'

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation<void, unknown, { token: string; password: string }>({
    mutationFn: ({ token, password }) =>
      publicClient.post('/auth/reset-password', { token, password }).then(() => undefined),
    onSuccess: () => {
      navigate('/login', { state: { resetSuccess: true } })
    },
  })
}
