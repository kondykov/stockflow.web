<script setup lang="ts">

import {useStockList} from "~/composables/warehouse/stock/useStockList";
import StockTable from "~/components/dashboard/warehouse/stock/StockTable.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: 'authenticated',
  title: 'Остатки',
  breadcrumb: [
    { label: 'Склады', to: '/dashboard/warehouse' },
    { label: 'Остатки' }
  ]
})

const route = useRoute()
const notify = useNotify()

const warehouseId = computed(() => Number(route.params.id))

const {
  items,
  pending,
  errorMessage,
  fetchStock
} = useStockList(warehouseId.value)

onMounted(() => {
  fetchStock().catch((e) => {
    notify.error('Ошибка', e?.message || 'Не удалось загрузить остатки')
  })
})
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <div class="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Остатки</h1>
        <p class="text-sm text-gray-500">Текущие остатки по складу</p>
      </div>

      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        :loading="pending"
        :disabled="pending"
        @click="fetchStock"
      >
        Обновить
      </UButton>
    </div>

    <UCard>
      <div v-if="pending" class="p-4 space-y-3">
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
      </div>

      <div v-else-if="errorMessage" class="p-4">
        <UAlert
          title="Ошибка загрузки"
          :description="errorMessage || undefined"
          color="error"
          variant="soft"
          icon="i-lucide-alert-circle"
        />
      </div>

      <template v-else>
        <StockTable :data="items" />
      </template>
    </UCard>
  </UContainer>
</template>
