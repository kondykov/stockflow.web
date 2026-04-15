<script setup lang="ts">
import WarehouseTable from '~/components/dashboard/warehouse/WarehouseTable.vue'
import { useWarehousesList } from '~/composables/warehouse/useWarehousesList'

definePageMeta({
  layout: 'dashboard',
  middleware: 'authenticated',
  title: 'Склады',
  breadcrumb: [
    { label: 'Склады' }
  ]
})

const notify = useNotify()

const {
  page,
  pageSize,
  warehouses,
  pending,
  totalCount,
  fetchWarehouses,
  setSearch
} = useWarehousesList({ pageSize: 20 })

const searchQuery = ref('')
const errorMessage = ref<string | null>(null)

const load = async () => {
  errorMessage.value = null
  try {
    await fetchWarehouses()
  } catch (e: any) {
    errorMessage.value = e?.message || 'Не удалось загрузить склады'
    notify.error('Ошибка', errorMessage.value || 'Не удалось загрузить склады')
  }
}

let skipNextPageWatch = false
watch(page, () => {
  if (skipNextPageWatch) {
    skipNextPageWatch = false
    return
  }

  load()
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
let skipNextSearchWatch = false
watch(searchQuery, (value) => {
  if (skipNextSearchWatch) {
    skipNextSearchWatch = false
    return
  }

  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(async () => {
    try {
      if (page.value !== 1) skipNextPageWatch = true
      await setSearch(value)
    } catch (e: any) {
      errorMessage.value = e?.message || 'Не удалось загрузить склады'
      notify.error('Ошибка', errorMessage.value || 'Не удалось загрузить склады')
    }
  }, 400)
})

onMounted(() => {
  load()
})

const onOpen = (id: number) => navigateTo(`/dashboard/warehouse/${id}`)

const resetSearch = async () => {
  if (searchTimer) clearTimeout(searchTimer)

  skipNextSearchWatch = true
  searchQuery.value = ''

  if (page.value !== 1) skipNextPageWatch = true
  await setSearch('')
}
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <div class="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Склады</h1>
        <p class="text-sm text-gray-500">Управление складами, адресами и доступом</p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="pending"
          :disabled="pending"
          @click="load"
        >
          Обновить
        </UButton>

        <UButton
          color="primary"
          icon="i-lucide-plus"
          to="/dashboard/warehouse/new"
        >
          Новый склад
        </UButton>
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Поиск по названию/адресу..."
            class="max-w-xs"
          />

          <div class="text-xs text-gray-400">
            Найдено: {{ totalCount }}
          </div>
        </div>
      </template>

      <div v-if="errorMessage" class="p-4">
        <UAlert
          title="Ошибка загрузки"
          :description="errorMessage || undefined"
          color="error"
          variant="soft"
          icon="i-lucide-alert-circle"
        />
      </div>

      <div v-else-if="!pending && warehouses.length === 0" class="p-10 text-center">
        <UIcon name="i-lucide-warehouse" class="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <div class="text-lg font-semibold">Склады не найдены</div>
        <div class="text-sm text-gray-500 mt-1">Попробуйте изменить запрос или создайте новый склад</div>

        <div class="flex items-center justify-center gap-2 mt-5">
          <UButton color="neutral" variant="outline" :disabled="pending" @click="resetSearch">
            Сбросить поиск
          </UButton>
          <UButton color="primary" to="/dashboard/warehouse/new" icon="i-lucide-plus">
            Создать склад
          </UButton>
        </div>
      </div>

      <template v-else>
        <WarehouseTable :data="warehouses" :loading="pending" @open="onOpen" />
      </template>

      <template #footer v-if="totalCount > pageSize">
        <div class="flex items-center justify-end px-4 py-3">
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="totalCount"
            :disabled="pending"
            show-first
            show-last
          />
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
