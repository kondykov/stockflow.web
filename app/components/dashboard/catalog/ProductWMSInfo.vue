<script setup lang="ts">
import type { ProductState } from '~/types/product'

defineProps<{
  product: ProductState
}>()
</script>

<template>
  <div class="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-xs space-y-2">
    <div class="flex items-center gap-2 text-primary">
      <UIcon name="i-lucide-database" class="w-4 h-4" />
      <span class="font-bold uppercase tracking-wider">Для WMS / ERP</span>
    </div>
    <div class="space-y-1 font-mono">
      <div class="flex justify-between">
        <span class="text-gray-500">SKU Code:</span>
        <span class="font-bold">{{ product.sku.code || '—' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">SKU Name:</span>
        <span class="font-bold">{{ product.sku.name || '—' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Фото:</span>
        <span class="font-bold">{{ product.images.length }} шт.</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-500">Характеристики:</span>
        <span class="font-bold">{{ product.attributes.filter(a => a.key && a.value).length }}</span>
      </div>
    </div>
  </div>
</template>
