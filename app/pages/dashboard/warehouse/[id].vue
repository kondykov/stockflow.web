<script setup lang="ts">
import WarehouseForm from '~/components/dashboard/warehouse/WarehouseForm.vue'
import type { ValidationError } from '~/types/apiResponse'
import type { Warehouse } from '~/types/warehouse'
import { useWarehouseApi } from '~/composables/warehouse/useWarehouseApi'

definePageMeta({
  layout: 'dashboard',
  middleware: 'authenticated',
  title: 'Склад',
  breadcrumb: [
    { label: 'Склады', to: '/dashboard/warehouse' },
    { label: 'Карточка' }
  ]
})

const route = useRoute()
const toast = useToast()
const api = useWarehouseApi()

const warehouseId = computed(() => Number(route.params.id))

const pending = ref(false)
const saving = ref(false)
const deleting = ref(false)

const warehouse = ref<Warehouse | null>(null)
const errorMessage = ref<string | null>(null)

const editMode = ref(false)
const errors = ref<ValidationError | null>(null)
const isDeleteOpen = ref(false)

useHead({
  title: () => (warehouse.value?.name ? `Склад: ${warehouse.value.name}` : 'Склад')
})

const load = async () => {
  errorMessage.value = null
  pending.value = true
  try {
    const res = await api.getWarehouseById(warehouseId.value)
    if (!res.successful) {
      throw new Error(res.message || 'Не удалось загрузить склад')
    }

    warehouse.value = res.data
  } catch (e: any) {
    errorMessage.value = e?.message || 'Не удалось загрузить склад'
    toast.add({
      title: 'Ошибка',
      description: errorMessage.value || '',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  load()
})

const startEdit = () => {
  errors.value = null
  editMode.value = true
}

const cancelEdit = () => {
  errors.value = null
  editMode.value = false
}

const save = async (payload: { name: string; address: string }) => {
  if (!warehouse.value?.id) return

  saving.value = true
  errors.value = null

  try {
    const res = await api.updateWarehouse(warehouse.value.id, payload)

    if (!res.successful) {
      errors.value = (res.data as any) as ValidationError
      throw new Error(res.message || 'Не удалось сохранить')
    }

    warehouse.value = res.data
    editMode.value = false

    toast.add({
      title: 'Успешно',
      description: 'Изменения сохранены',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  } catch (e: any) {
    toast.add({
      title: 'Ошибка',
      description: e?.message || 'Не удалось сохранить',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  if (!warehouse.value?.id) return

  deleting.value = true
  try {
    const res = await api.deleteWarehouse(warehouse.value.id)
    if (!res.successful) {
      throw new Error(res.message || 'Не удалось удалить склад')
    }

    toast.add({
      title: 'Удалено',
      description: 'Склад удалён',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })

    isDeleteOpen.value = false
    await navigateTo('/dashboard/warehouse')
  } catch (e: any) {
    toast.add({
      title: 'Ошибка',
      description: e?.message || 'Не удалось удалить склад',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UContainer class="py-6 space-y-6 max-w-3xl">
    <div class="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ warehouse?.name || 'Склад' }}
        </h1>
        <p class="text-sm text-gray-500">Просмотр и редактирование данных склада</p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/dashboard/warehouse"
        >
          К списку
        </UButton>

        <UButton
          v-if="!editMode"
          color="primary"
          icon="i-lucide-pencil"
          :disabled="pending || !warehouse"
          @click="startEdit"
        >
          Редактировать
        </UButton>

        <UButton
          v-if="!editMode"
          color="error"
          variant="soft"
          icon="i-lucide-trash"
          :disabled="pending || !warehouse"
          @click="isDeleteOpen = true"
        >
          Удалить
        </UButton>
      </div>
    </div>

    <div v-if="pending">
      <UCard>
        <div class="p-4 space-y-3">
          <USkeleton class="h-6 w-1/2" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-6 w-1/3" />
          <USkeleton class="h-10 w-full" />
        </div>
      </UCard>
    </div>

    <div v-else-if="errorMessage">
      <UAlert
        title="Ошибка"
        :description="errorMessage || undefined"
        color="error"
        variant="soft"
        icon="i-lucide-alert-circle"
      />

      <div class="mt-4">
        <UButton color="neutral" variant="outline" icon="i-lucide-refresh-cw" @click="load">
          Повторить
        </UButton>
      </div>
    </div>

    <template v-else>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="font-semibold">Основные данные</div>
            <UBadge v-if="warehouse?.id" color="neutral" variant="soft">ID: {{ warehouse.id }}</UBadge>
          </div>
        </template>

        <div v-if="!editMode" class="space-y-4">
          <div>
            <div class="text-xs text-gray-500 uppercase tracking-wider">Название</div>
            <div class="text-base font-medium">{{ warehouse?.name }}</div>
          </div>

          <div>
            <div class="text-xs text-gray-500 uppercase tracking-wider">Адрес</div>
            <div class="text-base font-medium">{{ warehouse?.address }}</div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500 uppercase tracking-wider">Создан</div>
              <div class="text-sm text-gray-700 dark:text-gray-300">{{ warehouse?.createdAt || '—' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 uppercase tracking-wider">Обновлён</div>
              <div class="text-sm text-gray-700 dark:text-gray-300">{{ warehouse?.updatedAt || '—' }}</div>
            </div>
          </div>
        </div>

        <div v-else>
          <WarehouseForm
            :initial-value="{ name: warehouse?.name, address: warehouse?.address }"
            :pending="saving"
            :errors="errors"
            submit-label="Сохранить"
            @submit="save"
            @cancel="cancelEdit"
          />
        </div>
      </UCard>
    </template>

    <UModal v-model="isDeleteOpen" title="Удалить склад?">
      <template #body>
        <div class="p-4 space-y-2">
          <div class="text-sm">
            Вы уверены, что хотите удалить склад
            <span class="font-semibold">{{ warehouse?.name }}</span>?
          </div>
          <div class="text-xs text-gray-500">Это действие невозможно отменить.</div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 px-4 py-3">
          <UButton color="neutral" variant="ghost" :disabled="deleting" @click="isDeleteOpen = false">
            Отмена
          </UButton>
          <UButton color="error" :loading="deleting" :disabled="deleting" @click="confirmDelete">
            Удалить
          </UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
