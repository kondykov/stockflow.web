<script setup lang="ts">
import type { ValidationError } from '~/types/apiResponse'

type WarehouseFormState = {
  name: string
  address: string
}

const props = withDefaults(
  defineProps<{
    initialValue?: Partial<WarehouseFormState>
    pending?: boolean
    errors?: ValidationError | null
    submitLabel?: string
    showCancel?: boolean
  }>(),
  {
    pending: false,
    errors: null,
    submitLabel: 'Сохранить',
    showCancel: true
  }
)

const emit = defineEmits<{
  submit: [payload: WarehouseFormState]
  cancel: []
}>()

const state = reactive<WarehouseFormState>({
  name: props.initialValue?.name ?? '',
  address: props.initialValue?.address ?? ''
})

watch(
  () => props.initialValue,
  (v) => {
    state.name = v?.name ?? ''
    state.address = v?.address ?? ''
  },
  { deep: true }
)

const fieldError = (key: keyof WarehouseFormState) => {
  const e = props.errors?.[key as string]
  if (!e) return undefined
  return Array.isArray(e) ? e.join(', ') : String(e)
}

const onSubmit = () => {
  emit('submit', { name: state.name.trim(), address: state.address.trim() })
}
</script>

<template>
  <UForm :state="state" @submit.prevent="onSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFieldGroup label="Название" name="name" required :error="fieldError('name')">
        <UInput v-model="state.name" placeholder="Например: Основной склад" :disabled="pending" />
      </UFieldGroup>

      <UFieldGroup
        label="Адрес"
        name="address"
        required
        :error="fieldError('address')"
        class="md:col-span-2"
      >
        <UInput v-model="state.address" placeholder="Город, улица, дом" :disabled="pending" />
      </UFieldGroup>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        v-if="showCancel"
        color="neutral"
        variant="ghost"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Отмена
      </UButton>

      <UButton type="submit" color="primary" :loading="pending" :disabled="pending">
        {{ submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
