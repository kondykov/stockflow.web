<script setup lang="ts">
import WarehouseForm from '~/components/dashboard/warehouse/WarehouseForm.vue'
import type { ValidationError } from '~/types/apiResponse'
import { useWarehouseApi } from '~/composables/warehouse/useWarehouseApi'

definePageMeta({
  layout: 'dashboard',
  middleware: 'authenticated',
  title: 'Новый склад',
  breadcrumb: [
    { label: 'Склады', to: '/dashboard/warehouse' },
    { label: 'Новый склад' }
  ]
})

const notify = useNotify()
const api = useWarehouseApi()

const pending = ref(false)
const errors = ref<ValidationError | null>(null)

const create = async (payload: { name: string; address: string }) => {
  pending.value = true
  errors.value = null

  try {
    const res = await api.createWarehouse(payload)

    if (!res.successful) {
      errors.value = (res.data as any) as ValidationError
      throw new Error(res.message || 'Не удалось создать склад')
    }

    notify.success('Успешно', 'Склад создан')

    const id = (res.data as any)?.id
    if (id) {
      await navigateTo(`/dashboard/warehouse/${id}`)
    } else {
      await navigateTo('/dashboard/warehouse')
    }
  } catch (e: any) {
    notify.error('Ошибка', e?.message || 'Не удалось создать склад')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UContainer class="py-6 space-y-6 max-w-3xl">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Новый склад</h1>
      <p class="text-sm text-gray-500">Заполните основные данные склада</p>
    </div>

    <UCard>
      <WarehouseForm
        :pending="pending"
        :errors="errors"
        submit-label="Создать"
        @submit="create"
        @cancel="navigateTo('/dashboard/warehouse')"
      />
    </UCard>
  </UContainer>
</template>
