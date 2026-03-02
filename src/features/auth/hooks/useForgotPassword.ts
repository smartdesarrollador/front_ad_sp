import { useMutation } from '@tanstack/react-query'
import { publicClient } from '@/lib/api'

export function useForgotPassword() {
  return useMutation<void, unknown, string>({
    mutationFn: (email) =>
      publicClient.post('/auth/forgot-password', { email }).then(() => undefined),
  })
}
