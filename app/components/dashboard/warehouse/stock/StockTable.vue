<script setup lang="ts">
import type { Stock } from '~/types/stock'

const props = defineProps<{
  data: Stock[]
  loading?: boolean
}>()

const columns = [
  { accessorKey: 'itemName', header: 'Товар' },
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'onHand', header: 'Остаток' }
]
</script>

<template>
  <UTable :rows="data" :columns="columns" :loading="loading" />
</template>
