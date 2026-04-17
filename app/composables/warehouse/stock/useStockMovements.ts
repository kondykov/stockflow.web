import type { StockMovement } from '~/types/stockMovement'
import type { PaginatedResponse } from '~/types/apiResponse'
import { useStockApi } from '~/composables/warehouse/stock/useStockApi'

export function useStockMovements(warehouseId: number, pageSize = 20) {
  const api = useStockApi()

  const page = ref(1)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const movements = ref<StockMovement[]>([])
  const totalCount = ref(0)

  const fetchMovements = async () => {
    pending.value = true
    errorMessage.value = null

    try {
      const res = await api.getMovements(warehouseId, { page: page.value, pageSize })
      if (!res.successful) {
        throw new Error(res.message || 'Не удалось загрузить движения')
      }

      const paginationData = res.data as PaginatedResponse<StockMovement>

      movements.value = paginationData.items
      totalCount.value = paginationData.totalCount
    } catch (e: any) {
      errorMessage.value = e?.message || 'Не удалось загрузить движения'
      throw e
    } finally {
      pending.value = false
    }
  }

  watch(page, () => {
    fetchMovements().catch(() => {})
  })

  return {
    page,
    pageSize,
    movements,
    pending,
    errorMessage,
    totalCount,
    fetchMovements
  }
}
