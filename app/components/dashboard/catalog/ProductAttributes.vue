<script setup lang="ts">
import type { ProductAttribute } from '~/types/product'

interface Props {
  attributes: ProductAttribute[]
  mode?: 'editable' | 'readonly'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'readonly'
})

const emit = defineEmits<{
  'add-attribute': []
  'remove-attribute': [index: number]
  'update-attribute': [index: number, key: string, value: string]
}>()

const isEditable = computed(() => props.mode === 'editable')

const updateAttribute = (index: number, key: string, value: string) => {
  if (!isEditable.value) return
  emit('update-attribute', index, key, value)
}

const handleAddAttribute = () => {
  emit('add-attribute')
}

const handleRemoveAttribute = (index: number) => {
  emit('remove-attribute', index)
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">Характеристики</h3>
        <UButton
          v-if="isEditable"
          icon="i-lucide-plus"
          size="sm"
          variant="ghost"
          label="Добавить"
          @click="handleAddAttribute"
        />
      </div>
    </template>

    <div v-if="attributes.length === 0" class="text-center py-8 text-gray-400 text-sm">
      <UIcon name="i-lucide-tags" class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p>Нет добавленных характеристик</p>
      <p v-if="isEditable" class="text-xs">Нажмите "Добавить" чтобы указать свойства товара</p>
    </div>

    <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
      <div v-for="(attr, i) in attributes" :key="i" class="py-3">
        <!-- Editable режим -->
        <div v-if="isEditable" class="flex gap-3 items-center">
          <UInput
            :model-value="attr.key"
            placeholder="Название (напр. Материал)"
            class="flex-1"
            @update:model-value="updateAttribute(i, $event, attr.value)"
          />
          <UInput
            :model-value="attr.value"
            placeholder="Значение (напр. Хлопок)"
            class="flex-1"
            @update:model-value="updateAttribute(i, attr.key, $event)"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="handleRemoveAttribute(i)"
          />
        </div>

        <!-- Readonly режим -->
        <div v-else class="flex justify-between items-center">
          <span class="text-gray-600 dark:text-gray-400">{{ attr.key }}</span>
          <span class="font-semibold">{{ attr.value }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
