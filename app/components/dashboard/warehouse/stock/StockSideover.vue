<script setup lang="ts">
import type {StockMovementType} from '~/types/stockMovement'
import type {Stock} from '~/types/stock'
import StockMovementForm from './StockMovementForm.vue'
import {useProductsList} from '~/composables/catalog/useProductList'

type SideoverMode = 'select-product' | 'operations' | 'form'

interface Props {
  isOpen: boolean
  selectedStock: Stock | null
  warehouseId: number
  pending?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pending: false
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [formData: any]
  'cancel': []
}>()

const mode = ref<SideoverMode>('operations')
const selectedMovementType = ref<StockMovementType | null>(null)
const selectedProductId = ref<{id: string, label: string} | undefined>(undefined)
const selectedStock = ref<Stock | null>(null)

const {
  products,
  loading: productsLoading,
  fetchProducts,
  pagination,
  currentPage,
  nextPage
} = useProductsList({pageSize: 100})

const movementOptions = [
  {label: 'Записать поступление', type: 'incoming' as StockMovementType, icon: 'i-lucide-plus', color: 'success'},
  {label: 'Списать товар', type: 'outgoing' as StockMovementType, icon: 'i-lucide-minus', color: 'error'},
  {label: 'Коррекция остатков', type: 'adjustment' as StockMovementType, icon: 'i-lucide-edit', color: 'neutral'},
  {label: 'Перевести', type: 'transfer' as StockMovementType, icon: 'i-lucide-arrow-right', color: 'info'}
]

const productItems = computed(() => {
  return products.value.map((p, index) => ({
    id: String(index),
    label: `${p.name} (${p.skuCode})`
  }))
})

const selectMovementType = (type: StockMovementType) => {
  selectedMovementType.value = type
  mode.value = 'form'
}

const selectProductForIncoming = () => {
  console.log('sdgsdg')
  if (selectedProductId.value !== undefined) {
    const index = parseInt(selectedProductId.value.id)
    const selectedProduct = products.value[index]
    if (selectedProduct) {
      selectedStock.value = {
        warehouseId: props.warehouseId,
        stockItemId: selectedProduct.id,
        onHand: 0,
        skuCode: selectedProduct.skuCode,
        skuName: selectedProduct.name,
        productId: selectedProduct.id
      }
      selectedMovementType.value = 'incoming'
      mode.value = 'form'
    }
  }
}

const goBack = () => {
  if (props.selectedStock) {
    mode.value = 'operations'
  } else {
    mode.value = 'select-product'
  }
  selectedMovementType.value = null
  selectedProductId.value = undefined
  selectedStock.value = null
}

const handleClose = () => {
  mode.value = 'operations'
  selectedMovementType.value = null
  selectedProductId.value = undefined
  selectedStock.value = null
  emit('update:isOpen', false)
}

const handleFormSubmit = (formData: any) => {
  emit('submit', formData)
  handleClose()
}

const loadMore = async () => {
  await nextPage()
}

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      if (props.selectedStock) {
        mode.value = 'operations'
        selectedStock.value = props.selectedStock
      } else {
        mode.value = 'select-product'
        await fetchProducts(1)
      }
    } else {
      mode.value = 'operations'
      selectedMovementType.value = null
      selectedProductId.value = undefined
      selectedStock.value = null
    }
  }
)
</script>

<template>
  <USlideover :open="isOpen" @update:open="handleClose">
    <template #body>
      <div class="p-6 space-y-4">
        <template v-if="mode === 'select-product'">
          <div>
            <h2 class="text-xl font-bold mb-4">Выбрать товар</h2>
            <p class="text-sm text-gray-500 mb-4">Товаров загружено: {{ products.length }}</p>

            <div v-if="productsLoading && products.length === 0" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p class="text-gray-500 mt-2">Загрузка товаров...</p>
            </div>

            <div v-else>
              <UFieldGroup label="Товар" name="product" required>
                <USelectMenu
                  v-model="selectedProductId"
                  :items="productItems"
                  value-attribute="id"
                  option-attribute="label"
                  placeholder="Выберите товар..."
                  searchable
                  :loading="productsLoading"
                />
              </UFieldGroup>

              <div v-if="pagination.hasMorePages" class="pt-4">
                <UButton
                  block
                  color="neutral"
                  variant="soft"
                  :loading="productsLoading"
                  @click="loadMore"
                  size="sm"
                >
                  Загрузить еще товары
                </UButton>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <UButton
              block
              color="primary"
              :disabled="!selectedProductId"
              @click="selectProductForIncoming"
            >
              Далее
            </UButton>
            <UButton
              block
              color="neutral"
              variant="ghost"
              @click="handleClose"
            >
              Отмена
            </UButton>
          </div>
        </template>

        <template v-else-if="mode === 'operations'">
          <div v-if="selectedStock">
            <h2 class="text-xl font-bold mb-2">{{ selectedStock.skuName }}</h2>
            <p class="text-gray-600 mb-4">{{ selectedStock.skuCode }}</p>
            <p class="text-sm text-gray-500 mb-6">
              Остаток: <strong class="text-lg">{{ selectedStock.onHand }}</strong>
            </p>
          </div>

          <div class="space-y-2">
            <h3 class="font-semibold text-gray-900 mb-4">Выберите операцию:</h3>
            <UButton
              v-for="option in movementOptions"
              :key="option.type"
              :icon="option.icon"
              :color="option.color"
              block
              size="lg"
              class="justify-start"
              @click="selectMovementType(option.type)"
            >
              {{ option.label }}
            </UButton>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            block
            @click="handleClose"
          >
            Отмена
          </UButton>
        </template>

        <template v-else-if="mode === 'form'">
          <div class="mb-6">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              @click="goBack"
            >
              Назад
            </UButton>
          </div>

          <div class="mb-4">
            <h2 class="text-xl font-bold">{{ movementOptions.find(o => o.type === selectedMovementType)?.label }}</h2>
            <p class="text-sm text-gray-500 mt-2">{{ selectedStock?.skuCode }} - {{ selectedStock?.skuName }}</p>
            <p class="text-sm text-gray-600 mt-1">
              Остаток: <strong>{{ selectedStock?.onHand }}</strong>
            </p>
          </div>

          <StockMovementForm
            :warehouse-id="props.warehouseId"
            :stock-item-id="selectedStock!.stockItemId"
            :type="selectedMovementType!"
            :pending="pending"
            @submit="handleFormSubmit"
            @cancel="goBack"
          />
        </template>
      </div>
    </template>
  </USlideover>
</template>
