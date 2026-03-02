import { useMutation } from '@tanstack/react-query'
import { useAuthContext } from '../AuthContext'
import type { RegisterRequest } from '@/types/auth'

export function useRegister() {
  const { register } = useAuthContext()

  return useMutation<void, unknown, RegisterRequest>({
    mutationFn: (data) => register(data),
  })
}
