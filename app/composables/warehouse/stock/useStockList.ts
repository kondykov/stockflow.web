import { ref, computed, watch, type Ref } from 'vue'
import { useStockApi } from '~/composables/warehouse/stock/useStockApi'
import type { Stock } from '~/types/stock'
import type { PaginationResponse } from '~/types/apiResponse'

export function useStockList(warehouseId: Ref<number>, options: { pageSize?: number } = {}) {
  const api = useStockApi()

  const pageSize = options.pageSize ?? 20
  const page = ref(1)
  const search = ref('')
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)

  const items = ref<Stock[]>([])
  const totalCount = ref(0)
  const totalPages = ref(0)

  const fetchStock = async () => {
    pending.value = true
    errorMessage.value = null

    try {
      const response = await api.getStock(warehouseId.value, page.value, pageSize, search.value)

      if (!response.successful) {
        throw new Error(response.message || 'Не удалось загрузить остатки')
      }

      const data = response.data as PaginationResponse<Stock[]>

      items.value = data.items ?? []
      totalCount.value = data.totalCount ?? 0
      totalPages.value = data.totalPages ?? 0
    } catch (e: any) {
      errorMessage.value = e.message || 'Не удалось загрузить остатки'
      throw e
    } finally {
      pending.value = false
    }
  }

  const setSearch = async (value: string) => {
    search.value = value
    page.value = 1
    await fetchStock()
  }

  watch(warehouseId, () => fetchStock())

  return {
    page,
    pageSize,
    search,
    items,
    pending,
    errorMessage,
    totalCount,
    totalPages,
    fetchStock,
    setSearch
  }
}
