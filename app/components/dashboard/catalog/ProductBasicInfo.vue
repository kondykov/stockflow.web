<script setup lang="ts">
import type { ProductState } from '~/types/product'

interface Props {
  modelValue: ProductState
  mode?: 'editable' | 'readonly'
  disabledFields?: ('name' | 'skuCode' | 'skuName')[]
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'readonly',
  disabledFields: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: ProductState]
}>()

const isEditable = computed(() => props.mode === 'editable')

const isFieldDisabled = (field: string) => {
  return !isEditable.value || props.disabledFields.includes(field as any)
}

const updateName = (value: string) => {
  if (isFieldDisabled('name')) return
  emit('update:modelValue', { ...props.modelValue, name: value })
}

const updateSkuCode = (value: string) => {
  if (isFieldDisabled('skuCode')) return
  emit('update:modelValue', {
    ...props.modelValue,
    sku: { ...props.modelValue.sku, code: value }
  })
}

const updateSkuName = (value: string) => {
  if (isFieldDisabled('skuName')) return
  emit('update:modelValue', {
    ...props.modelValue,
    sku: { ...props.modelValue.sku, name: value }
  })
}
</script>

<template>
  <UCard>
    <div class="space-y-5">
      <div>
        <UFormField label="Название товара" name="name" required>
          <UInput
            :model-value="modelValue.name"
            placeholder="Введите название"
            size="lg"
            :disabled="isFieldDisabled('name')"
            @update:model-value="updateName"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <UFormField label="Код SKU" name="sku.code" required>
            <UInput
              :model-value="modelValue.sku.code"
              placeholder="PRD-001"
              :disabled="isFieldDisabled('skuCode')"
              @update:model-value="updateSkuCode"
            />
          </UFormField>
        </div>

        <div>
          <UFormField label="Название SKU" name="sku.name" required>
            <UInput
              :model-value="modelValue.sku.name"
              placeholder="Основной артикул"
              :disabled="isFieldDisabled('skuName')"
              @update:model-value="updateSkuName"
            />
          </UFormField>
        </div>
      </div>
    </div>
  </UCard>
</template>
