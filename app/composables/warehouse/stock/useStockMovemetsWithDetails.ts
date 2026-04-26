import { ref, computed, watch, type Ref } from 'vue'
import type { StockMovement } from '~/types/stockMovement'
import type { Product } from '~/types/product'
import { useStockMovements } from './useStockMovements'
import { useStockList } from './useStockList'
import { useProductApi } from '~/composables/catalog/useProductApi'

interface EnrichedStockMovement extends StockMovement {
  skuCode: string | undefined
  skuName: string | undefined
}

export function useStockMovementsWithDetails(warehouseId: Ref<number>) {
  const stockMovements = useStockMovements(warehouseId)
  const stockList = useStockList(warehouseId)
  const productApi = useProductApi()

  const enrichedItems = ref<EnrichedStockMovement[]>([])
  const enriching = ref(false)
  const productCache = ref<Record<number, Product>>({})

  const enrichMovements = async () => {
    enriching.value = true
    try {
      const missingIds = new Set<number>()

      for (const movement of stockMovements.items.value) {
        const inStock = stockList.items.value.find(
          (s) => s.stockItemId === movement.stockItemId
        )
        if (!inStock && !productCache.value[movement.stockItemId]) {
          missingIds.add(movement.stockItemId)
        }
      }

      for (const id of missingIds) {
        try {
          const response = await productApi.getProduct(id)
          if (response.successful && response.data) {
            productCache.value[id] = response.data as Product
          }
        } catch (e) {
          console.error(`Не удалось загрузить товар ${id}`, e)
        }
      }

      enrichedItems.value = stockMovements.items.value.map((movement) => {
        const stock = stockList.items.value.find(
          (s) => s.stockItemId === movement.stockItemId
        )
        const product = productCache.value[movement.stockItemId]

        return {
          ...movement,
          skuCode: stock?.skuCode || product?.skuCode || `ID: ${movement.stockItemId}`,
          skuName: stock?.skuName || product?.name || 'Неизвестный товар'
        }
      })
    } finally {
      enriching.value = false
    }
  }

  watch(
    [() => stockMovements.items.value, () => stockList.items.value],
    () => enrichMovements(),
    { deep: true }
  )

  return {
    items: enrichedItems,
    pending: computed(() => stockMovements.pending.value || enriching.value),
    page: stockMovements.page,
    fetchMovements: stockMovements.fetchMovements
  }
}
