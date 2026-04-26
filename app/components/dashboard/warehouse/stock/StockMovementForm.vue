<script setup lang="ts">
import type { StockMovementType } from '~/types/stockMovement'
import type { Stock } from '~/types/stock'
import { useStockApi } from '~/composables/warehouse/stock/useStockApi'

const props = defineProps<{
  warehouseId: number
  stockItemId: number
  type: StockMovementType
  pending?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])
const stockApi = useStockApi()

const { data: stockResponse } = await useAsyncData('stocks-list', () =>
  stockApi.getStock(props.warehouseId, 1, 100)
)

const stockOptions = computed(() => {
  const items = stockResponse.value?.data?.items || []

  const options = items
    .filter((s: Stock) => s.stockItemId !== props.stockItemId)
    .map((s: Stock) => ({
      label: `${s.skuName} (${s.skuCode}) - остаток: ${s.onHand}`,
      value: s.stockItemId
    }))

  return options
})

const form = reactive({
  warehouseId: props.warehouseId,
  stockItemId: props.stockItemId,
  type: props.type,
  quantity: 1,
  toWarehouseId: null as number | null,
  reason: ''
})

const onSubmit = () => emit('submit', {...form})
</script>

<template>
  <UForm :state="form" @submit="onSubmit" class="space-y-4">
    <UFieldGroup
      v-if="type === 'transfer'"
      label="Переместить в:"
      name="toWarehouseId"
      required
    >
      <USelectMenu
        v-model="form.toWarehouseId"
        :options="stockOptions"
        value-attribute="value"
        placeholder="Выберите целевой сток"
        searchable
      />
    </UFieldGroup>

    <UFieldGroup label="Количество" name="quantity" required>
      <UInput v-model.number="form.quantity" type="number" min="1" size="lg" />
    </UFieldGroup>

    <UFieldGroup label="Причина (опционально)" name="reason">
      <UTextarea v-model="form.reason" placeholder="Комментарий к операции..." />
    </UFieldGroup>

    <div class="flex flex-col gap-2 pt-4">
      <UButton type="submit" color="primary" block size="lg" :loading="pending">
        {{ type === 'transfer' ? 'Подтвердить перемещение' : 'Сохранить' }}
      </UButton>
      <UButton variant="ghost" color="neutral" block @click="emit('cancel')">
        Отмена
      </UButton>
    </div>
  </UForm>
</template>
