<script setup lang="ts">
import type { ProductStatus } from '~/types/product'

defineProps<{
  status: ProductStatus
}>()
</script>

<template>
  <div
    class="p-5 rounded-2xl border transition-all"
    :class="{
      'border-green-500/30 bg-green-500/5': status.color === 'green',
      'border-yellow-500/30 bg-yellow-500/5': status.color === 'yellow',
      'border-orange-500/30 bg-orange-500/5': status.color === 'orange',
      'border-gray-500/30 bg-gray-500/5': status.color === 'gray'
    }"
  >
    <div class="flex gap-3 items-start">
      <UIcon
        :name="status.icon"
        class="w-5 h-5 mt-0.5"
        :class="{
          'text-green-500': status.color === 'green',
          'text-yellow-500': status.color === 'yellow',
          'text-orange-500': status.color === 'orange',
          'text-gray-500': status.color === 'gray'
        }"
      />
      <div class="flex-1">
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm font-medium">{{ status.label }}</span>
          <span class="text-xs text-gray-500">{{ status.percent }}%</span>
        </div>
        <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="{
              'bg-green-500': status.color === 'green',
              'bg-yellow-500': status.color === 'yellow',
              'bg-orange-500': status.color === 'orange',
              'bg-gray-500': status.color === 'gray'
            }"
            :style="{ width: `${status.percent}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">{{ status.message }}</p>
      </div>
    </div>
  </div>
</template>
