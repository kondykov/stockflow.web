export function useImageUrl(imagePath: string): string {
  if (!imagePath) return ''

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'http://localhost:8080'

  const path = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath

  return `${baseUrl}/${path}`
}
