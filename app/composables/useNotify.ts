import type {ApiResponse, ValidationError} from '~/types/apiResponse'

type ToastColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

type NotifyOptions = {
  title?: string
  description?: string
  color?: ToastColor
  icon?: string
}

const HTTP_STATUS_MAP: Record<string, string> = {
  '404 Not Found': 'Запрашиваемый ресурс не найден',
  '403 Forbidden': 'Доступ запрещен',
  '401 Unauthorized': 'Требуется авторизация',
  '500 Internal Server Error': 'Ошибка на стороне сервера',
  'Fetch Error': 'Ошибка сети или сервер недоступен'
}

/**
 * Очищает сообщение от технических деталей Nuxt/ofetch вида [GET] "url": 404...
 */
const cleanErrorMessage = (message: unknown): string | undefined => {
  if (typeof message !== 'string') return undefined

  let cleaned = message.replace(/^\[.*\]\s+".*":\s+/, '').trim()

  if (HTTP_STATUS_MAP[cleaned]) {
    return HTTP_STATUS_MAP[cleaned]
  }

  return cleaned.length ? cleaned : undefined
}

/**
 * Извлекает валидационные сообщения из объекта ошибок
 */
const extractValidationMessages = (data: unknown): string[] => {
  // Защита: если data null, undefined, массив или не объект — возвращаем пустой массив
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return []
  }

  const entries = Object.entries(data as ValidationError)
  const messages = entries
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .map(v => (typeof v === 'string' ? v.trim() : ''))
    .filter(v => !!v)

  return messages
}

export function useNotify() {
  const toast = useToast()

  const push = (opts: NotifyOptions) => {
    toast.add({
      title: opts.title,
      description: opts.description,
      color: opts.color,
      icon: opts.icon
    })
  }

  const success = (title = 'Успешно', description?: string) => {
    push({title, description, color: 'success', icon: 'i-lucide-check-circle'})
  }

  const error = (title = 'Ошибка', description?: string) => {
    push({title, description, color: 'error', icon: 'i-lucide-alert-circle'})
  }

  const info = (title: string, description?: string) => {
    push({title, description, color: 'info', icon: 'i-lucide-info'})
  }

  /**
   * Извлекает сообщение об ошибке из ApiResponse
   * Приоритет: валидационные ошибки > message от сервера > fallback
   */
  const extractApiMessage = <T>(res: ApiResponse<T>, fallback?: string): string => {
    // Сначала проверяем валидационные ошибки
    const validationMessages = extractValidationMessages(res.data)
    if (validationMessages.length > 0) {
      return validationMessages.join(', ')
    }

    // Потом проверяем сообщение от сервера
    const cleanedMessage = cleanErrorMessage(res.message)
    if (cleanedMessage) {
      return cleanedMessage
    }

    // Fallback
    return fallback || 'Произошла ошибка'
  }

  /**
   * Унифицированный обработчик ApiResponse.
   */
  const fromApi = <T>(
    res: ApiResponse<T>,
    options: {
      successTitle?: string
      successDescription?: string
      errorTitle?: string
      errorFallbackMessage?: string
    } = {}
  ) => {
    if (res.successful) {
      success(options.successTitle || 'Успешно', options.successDescription)
      return true
    }

    error(
      options.errorTitle || 'Ошибка',
      extractApiMessage(res, options.errorFallbackMessage)
    )
    return false
  }

  /**
   * Унифицированный обработчик исключений (fetch/reject).
   */
  const fromError = (e: unknown, options: { title?: string; fallback?: string } = {}) => {
    const anyErr = e as any

    const validationMessages = extractValidationMessages(anyErr?.data?.data)
    if (validationMessages.length > 0) {
      error(options.title || 'Ошибка', validationMessages.join(', '))
      return
    }

    const rawMessage =
      anyErr?.data?.message ||
      anyErr?.statusText ||
      anyErr?.message

    const message = cleanErrorMessage(rawMessage) || options.fallback || 'Произошла ошибка'

    error(options.title || 'Ошибка', message)
  }

  return {
    push,
    success,
    error,
    info,
    fromApi,
    fromError,
    extractValidationMessages,
    extractApiMessage
  }
}
