import type { ApiResponse, ValidationError } from '~/types/apiResponse'

type ToastColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

type NotifyOptions = {
  title?: string
  description?: string
  color?: ToastColor
  icon?: string
}

const normalizeText = (v: unknown): string | undefined => {
  if (typeof v === 'string') {
    const t = v.trim()
    return t.length ? t : undefined
  }
  return undefined
}

const extractValidationMessages = (data: unknown): string[] => {
  if (!data || typeof data !== 'object') return []

  const entries = Object.entries(data as ValidationError)
  const messages = entries
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .map(v => normalizeText(v))
    .filter((v): v is string => !!v)

  return messages
}

const extractApiMessage = <T>(res: ApiResponse<T>, fallback?: string) => {
  return (
    normalizeText(res.message) ||
    extractValidationMessages(res.data).at(0) ||
    fallback ||
    'Произошла ошибка'
  )
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
    push({
      title,
      description,
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }

  const error = (title = 'Ошибка', description?: string) => {
    push({
      title,
      description,
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }

  const info = (title: string, description?: string) => {
    push({
      title,
      description,
      color: 'info',
      icon: 'i-lucide-info'
    })
  }

  /**
   * Унифицированный обработчик ApiResponse.
   * - при successful=true покажет success toast
   * - при successful=false покажет error toast, возьмёт message из response или из ValidationError
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
   * Унифицированный обработчик любых исключений (fetch/useApi/прочее).
   */
  const fromError = (e: unknown, options: { title?: string; fallback?: string } = {}) => {
    const anyErr = e as any
    const message =
      normalizeText(anyErr?.message) ||
      normalizeText(anyErr?.data?.message) ||
      options.fallback ||
      'Произошла ошибка'

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
