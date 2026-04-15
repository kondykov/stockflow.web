import type { ProductState, ProductStatus } from '~/types/product'

export function useProductStatus(state: ComputedRef<ProductState>): ComputedRef<ProductStatus> {
  return computed(() => {
    const checks = {
      hasName: !!state.value.name.trim(),
      hasSkuCode: !!state.value.sku.code.trim(),
      hasSkuName: !!state.value.sku.name.trim(),
      hasImages: state.value.images.length > 0
    }

    const completedCount = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    const percent = Math.round((completedCount / totalChecks) * 100)

    if (percent === 100) {
      return {
        label: 'Готов к публикации',
        color: 'green',
        icon: 'i-lucide-check-circle',
        percent,
        message: 'Все поля заполнены'
      }
    }

    if (percent >= 50) {
      return {
        label: 'Частично заполнен',
        color: 'yellow',
        icon: 'i-lucide-clock',
        percent,
        message: `Заполнено ${percent}%`
      }
    }

    if (percent > 0) {
      return {
        label: 'Начато заполнение',
        color: 'orange',
        icon: 'i-lucide-alert-triangle',
        percent,
        message: `Заполнено ${percent}%`
      }
    }

    return {
      label: 'Пустой черновик',
      color: 'gray',
      icon: 'i-lucide-file-text',
      percent: 0,
      message: 'Начните заполнять карточку'
    }
  })
}
