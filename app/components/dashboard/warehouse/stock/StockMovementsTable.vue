<script setup lang="ts">
import type {StockMovement, StockMovementType} from '~/types/stockMovement'

interface EnrichedMovement extends StockMovement {
  skuCode?: string
  skuName?: string
}

const props = defineProps<{
  data: EnrichedMovement[]
  loading?: boolean
  totalCount?: number
  totalPages?: number
  currentPage?: number
}>()

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const movementTypeLabels: Record<string, string> = {
  incoming: 'Приход',
  outgoing: 'Расход',
  adjustment: 'Коррекция',
  transfer: 'Перемещение'
}

const columns = [
  { accessorKey: 'skuCode', header: 'SKU' },
  { accessorKey: 'skuName', header: 'Товар' },
  { accessorKey: 'type', header: 'Тип' },
  { accessorKey: 'qty', header: 'Кол-во' },
  { accessorKey: 'reason', header: 'Причина' },
  { accessorKey: 'createdAt', header: 'Дата' }
]

const goToPage = (page: number) => {
  emit('page-change', page)
}
</script>

<template>
  <div class="space-y-4">
    <UTable :rows="data" :columns="columns" :loading="loading">
      <template #type-data="{ row }">
        <UBadge>
          {{ movementTypeLabels[row.original.type as StockMovementType] || row.original.type }}
        </UBadge>
      </template>
    </UTable>

    <div v-if="totalPages && totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-500">
        Всего: {{ totalCount }}
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-chevron-left-20-solid"
          color="neutral"
          variant="ghost"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage! - 1)"
        />
        <div class="flex gap-1">
          <UButton
            v-for="p in totalPages"
            :key="p"
            :label="String(p)"
            :color="currentPage === p ? 'primary' : 'neutral'"
            :variant="currentPage === p ? 'soft' : 'ghost'"
            size="sm"
            @click="goToPage(p)"
          />
        </div>
        <UButton
          icon="i-heroicons-chevron-right-20-solid"
          color="neutral"
          variant="ghost"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage! + 1)"
        />
      </div>
    </div>
  </div>
</template>
