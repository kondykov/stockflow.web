import type { StockMovement } from '~/types/stockMovement'
import type { PaginationResponse } from '~/types/apiResponse'
import {useStockApi} from "~/composables/warehouse/stock/useStockApi";

export function useStockMovements(warehouseId: Ref<number>) {
  const api = useStockApi()
  const page = ref(1)
  const items = ref<StockMovement[]>([])
  const pending = ref(false)

  const fetchMovements = async () => {
    pending.value = true
    try {
      const response = await api.getMovements(warehouseId.value, { page: page.value })
      if (response.successful) {
        const data = response.data as PaginationResponse<StockMovement[]>
        items.value = data.items ?? []
      }
    } finally {
      pending.value = false
    }
  }

  watch(page, () => fetchMovements())
  watch(warehouseId, () => { page.value = 1; fetchMovements() })

  return { items, pending, page, fetchMovements }
}
