<script setup lang="ts">
import type { StockMovement } from '~/types/stockMovement'

const props = defineProps<{
  data: StockMovement[]
  loading?: boolean
}>()

const columns = [
  { accessorKey: 'createdAt', header: 'Дата' },
  { accessorKey: 'type', header: 'Тип' },
  { accessorKey: 'qty', header: 'Количество' },
  { accessorKey: 'reason', header: 'Причина' }
]
</script>

<template>
  <UTable :rows="data" :columns="columns" :loading="loading" />
</template>
