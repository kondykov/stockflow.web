import { useStockApi } from '~/composables/warehouse/stock/useStockApi'
import type { Stock } from '~/types/stock'

export function useStockList(warehouseId: number) {
  const api = useStockApi()

  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const items = ref<Stock[]>([])

  const fetchStock = async () => {
    pending.value = true
    errorMessage.value = null

    try {
      const res = await api.getStock(warehouseId)

      if (!res.successful) {
        throw new Error(res.message || 'Не удалось загрузить остатки')
      }

      items.value = res.data
    } catch (e: any) {
      errorMessage.value = e.message || 'Не удалось загрузить остатки'
      throw e
    } finally {
      pending.value = false
    }
  }

  return {
    items,
    pending,
    errorMessage,
    fetchStock
  }
}
