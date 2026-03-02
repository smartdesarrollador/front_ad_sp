export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}
