<script setup lang="ts">
import type { CreateStockMovementPayload, StockMovementType } from '~/types/stockMovement'

const props = defineProps<{
  warehouseId: number
  stockItemId: number
  type: StockMovementType
  pending?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: CreateStockMovementPayload): void
  (e: 'cancel'): void
}>()

const form = reactive<CreateStockMovementPayload>({
  warehouseId: props.warehouseId,
  stockItemId: props.stockItemId,
  type: props.type,
  qty: 0,
  reason: ''
})

const onSubmit = () => {
  emit('submit', { ...form })
}
</script>

<template>
  <UForm @submit="onSubmit">
    <UFormGroup label="Количество" required>
      <UInput v-model.number="form.qty" type="number" />
    </UFormGroup>

    <UFormGroup label="Причина">
      <UInput v-model="form.reason" />
    </UFormGroup>

    <div class="flex justify-end gap-2 mt-4">
      <UButton color="neutral" variant="ghost" type="button" :disabled="pending" @click="emit('cancel')">
        Отмена
      </UButton>
      <UButton color="primary" type="submit" :loading="pending">
        Сохранить
      </UButton>
    </div>
  </UForm>
</template>
