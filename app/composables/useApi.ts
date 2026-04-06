import type {ApiResponse, ValidationError} from "~/types/apiResponse";

export const useApi = async <T>(url: string, options: any = {}) => {
  const token = useCookie('auth_token')
  const config = useRuntimeConfig()
  const {logout} = useAuth()

  try {
    return $fetch<ApiResponse<T>>(url, {
      baseURL: config.public.apiBase,
      ...options,
      headers: {
        ...options.headers,
        ...(token.value ? {Authorization: `Bearer ${token.value}`} : {}),
      },

      async onResponseError({ response }) {
        if (response.status === 401) {
          await logout()
          throw new Error('Ваша сессия истекла')
        }
      }
    })
  } catch (error: any) {
    if (error.data?.data && typeof error.data.data === 'object') {
      return {
        successful: false,
        message: error.data?.message || 'Ошибка валидации',
        data: error.data.data as ValidationError
      } as ApiResponse<T>
    }
    return {
      successful: false,
      message: error.message || 'Ошибка сервера',
      data: null
    } as ApiResponse<T>
  }
}
