<script setup lang="ts">
import type { ProductState } from '~/types/product'

defineProps<{
  product: ProductState,
  productId? : number
}>()

const emit = defineEmits<{
  view: [id: number]
  edit: [id: number]
}>()

</script>

<template>
  <div class="group bg-white dark:bg-gray-900 rounded-[2rem] p-4 shadow-2xl border border-gray-100 dark:border-gray-800">
    <div class="aspect-[3/4] rounded-[1.5rem] overflow-hidden mb-6 bg-gray-50 dark:bg-gray-800 relative">
      <Transition name="fade" mode="out-in">
        <img
          v-if="product.images.length"
          :key="product.images[product.coverImageIndex]?.url"
          :src="product.images[product.coverImageIndex]?.url"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-300">
          <UIcon name="i-lucide-image" class="w-16 h-16 mb-2 opacity-20" />
          <span class="text-[10px] uppercase font-bold tracking-widest">Нет изображения</span>
        </div>
      </Transition>
      <div
        class="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-white/70 dark:bg-black/50 p-3 rounded-xl flex items-center justify-between"
      >
        <div class="flex flex-col">
          <span class="text-[10px] text-gray-500 font-bold uppercase">{{ product.sku.code || 'SKU' }}</span>
          <span class="text-xs font-black">{{ product.sku.name || 'Артикул' }}</span>
        </div>
        <div class="flex gap-1">
          <span v-if="product.images.length > 1" class="text-[10px] text-gray-500">
            {{ product.coverImageIndex + 1 }}/{{ product.images.length }}
          </span>
        </div>
      </div>
    </div>
    <div class="px-2 pb-4 space-y-4">
      <h4 class="text-xl font-black leading-tight line-clamp-2 uppercase italic">
        {{ product.name || 'Название позиции' }}
      </h4>
      <div
        v-if="product.attributes.filter(a => a.key && a.value).length > 0"
        class="grid grid-cols-2 gap-x-4 gap-y-3"
      >
        <div
          v-for="attr in product.attributes.filter(a => a.key && a.value).slice(0, 4)"
          :key="attr.key"
          class="space-y-0.5 border-l-2 border-primary/20 pl-2"
        >
          <span class="block text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{{ attr.key }}</span>
          <span class="block text-xs font-bold truncate">{{ attr.value }}</span>
        </div>
      </div>

      <div v-else class="text-xs text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-3">
        Характеристики не добавлены
      </div>
    </div>
    <slot name="footer" />
    <slot name="actions">
      <div class="flex gap-2 border-t pt-3" v-if="productId">
        <UButton
          icon="i-lucide-eye"
          color="neutral"
          variant="soft"
          size="sm"
          class="flex-1"
          @click="emit('view', productId)"
        >
          Открыть
        </UButton>
        <UButton
          icon="i-lucide-pen"
          color="primary"
          variant="soft"
          size="sm"
          class="flex-1"
          @click="emit('edit', productId)"
        >
          Редактировать
        </UButton>
      </div>
    </slot>
  </div>
</template>

<style scoped>

</style>
