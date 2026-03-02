import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthContext, type LoginResult } from '../AuthContext'

export function useLogin() {
  const navigate = useNavigate()
  const { login } = useAuthContext()

  return useMutation<LoginResult, unknown, { email: string; password: string }>({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (result) => {
      if ('ok' in result) {
        navigate('/')
      }
    },
  })
}
