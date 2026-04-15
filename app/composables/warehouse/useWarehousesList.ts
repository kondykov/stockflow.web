import { computed, ref } from 'vue'
import type { PaginatedResponse } from '~/types/apiResponse'
import type { Warehouse } from '~/types/warehouse'
import { useWarehouseApi } from '~/composables/warehouse/useWarehouseApi'

export function useWarehousesList(options: { pageSize?: number } = {}) {
  const api = useWarehouseApi()

  const pageSize = options.pageSize ?? 20
  const page = ref(1)
  const search = ref('')
  const pending = ref(false)

  const warehouses = ref<Warehouse[]>([])
  const totalCount = ref(0)
  const totalPages = ref(0)

  const fetchWarehouses = async () => {
    pending.value = true
    try {
      const response = await api.getWarehouses({
        page: page.value,
        pageSize,
        search: search.value
      })

      if (!response.successful) {
        throw new Error(response.message || 'Не удалось загрузить склады')
      }

      const data = response.data as PaginatedResponse<Warehouse>

      warehouses.value = data.items || []
      totalCount.value = data.totalCount || 0
      totalPages.value = data.totalPages || 0
    } finally {
      pending.value = false
    }
  }

  const setSearch = async (value: string) => {
    search.value = value
    page.value = 1
    await fetchWarehouses()
  }

  return {
    // state
    page,
    pageSize,
    search: computed(() => search.value),
    pending: computed(() => pending.value),

    warehouses: computed(() => warehouses.value),
    totalCount: computed(() => totalCount.value),
    totalPages: computed(() => totalPages.value),

    // actions
    fetchWarehouses,
    setSearch
  }
}
