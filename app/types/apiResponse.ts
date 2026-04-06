export interface ApiResponse<T> {
  successful: boolean
  message: string | null
  data: T
}

export interface ValidationError {
  [key: string]: string | string[]
}

export type ApiResponseError = ApiResponse<ValidationError>

export type PaginationResponse<T> = {
  page: number,
  pageSize: number,
  totalCount: number,
  totalPages: number,
  hasNextPage: boolean,
  items: T,
}
