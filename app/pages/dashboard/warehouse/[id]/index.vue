<script setup lang="ts">
import type {Stock} from '~/types/stock'
import WarehouseForm from '~/components/dashboard/warehouse/WarehouseForm.vue'
import StockTable from '~/components/dashboard/warehouse/stock/StockTable.vue'
import StockMovementsTable from '~/components/dashboard/warehouse/stock/StockMovementsTable.vue'
import type {ValidationError} from '~/types/apiResponse'
import type {Warehouse} from '~/types/warehouse'
import {useWarehouseApi} from '~/composables/warehouse/useWarehouseApi'
import {useStockList} from '~/composables/warehouse/stock/useStockList'
import {useStockMovementsWithDetails} from '~/composables/warehouse/stock/useStockMovemetsWithDetails'
import StockSideover from "~/components/dashboard/warehouse/stock/StockSideover.vue";
import {useStockApi} from "~/composables/warehouse/stock/useStockApi";
import type {CreateStockMovementPayload} from "~/types/stockMovement";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated', 'rbac'],
  title: 'Склад',
  breadcrumb: [
    {label: 'Склады', to: '/dashboard/warehouse'},
    {label: 'Карточка'}
  ]
})

const route = useRoute()
const notify = useNotify()
const warehouseApi = useWarehouseApi()

const stockApi = useStockApi()

const warehouseId = computed(() => Number(route.params.id))
const pending = ref(false)
const saving = ref(false)
const deleting = ref(false)
const warehouse = ref<Warehouse | undefined>(undefined)
const errorMessage = ref<string | null>(null)
const editMode = ref(false)
const errors = ref<ValidationError | null>(null)
const isDeleteOpen = ref(false)

const { can } = useAuth()

const actions = computed(() => {
  const baseActions = [
    {
      label: 'Управление',
      icon: 'i-lucide-settings',
      onSelect: openMovementSideover,
      permission: 'warehouse.stock.movements'
    },
    {
      label: 'Удалить',
      icon: 'i-lucide-trash',
      onSelect: handleDeleteStock,
      permission: 'warehouse.stock.remove'
    }
  ]

  return baseActions.filter(action => can(action.permission))
})

useHead({
  title: () => (warehouse.value?.name ? `Склад: ${warehouse.value.name}` : 'Склад')
})

const load = async () => {
  errorMessage.value = null
  pending.value = true
  try {
    const res = await warehouseApi.getWarehouseById(warehouseId.value)
    if (!res.successful) {
      errorMessage.value = notify.extractApiMessage(res, 'Склад не найден')
      return
    }
    warehouse.value = res.data
  } catch (e: any) {
    errorMessage.value = 'Не удалось загрузить данные склада'
    notify.fromError(e)
  } finally {
    pending.value = false
  }
}

const {
  page: stockPage,
  pageSize: stockPageSize,
  search: stockSearch,
  items: stocks,
  pending: stockPending,
  errorMessage: stockError,
  totalCount: stockTotal,
  totalPages: stockTotalPages,
  fetchStock,
  setSearch: setStockSearch
} = useStockList(warehouseId, {pageSize: 20})

const {
  items: movements,
  pending: movementsPending
} = useStockMovementsWithDetails(warehouseId)


const showMovementSideover = ref(false)
const selectedStock = ref<Stock | null>(null)
const movementFormPending = ref(false)

const openMovementSideover = async (stock: Stock) => {
  selectedStock.value = stock
  await nextTick()
  showMovementSideover.value = true
}

const handleMovementSubmit = async (formData: CreateStockMovementPayload) => {
  movementFormPending.value = true
  try {
    const response = await stockApi.sendMovement(warehouseId.value, formData)

    if (response.successful) {
      notify.success('Успешно', 'Движение создано')
      showMovementSideover.value = false
      selectedStock.value = null
      await fetchStock()
    } else {
      notify.fromApi(response)
    }
  } catch (error: any) {
    notify.fromError(error)
  } finally {
    movementFormPending.value = false
  }
}

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
    const res = await warehouseApi.updateWarehouse(warehouse.value.id, payload)
    if (notify.fromApi(res, {successDescription: 'Изменения сохранены'})) {
      warehouse.value = res.data
      editMode.value = false
    } else {
      errors.value = res.data as ValidationError
    }
  } catch (e) {
    notify.fromError(e)
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  if (!warehouse.value?.id) return
  deleting.value = true
  try {
    const res = await warehouseApi.deleteWarehouse(warehouse.value.id)
    if (notify.fromApi(res, {successTitle: 'Удалено', successDescription: 'Склад удалён'})) {
      isDeleteOpen.value = false
      await navigateTo('/dashboard/warehouse')
    }
  } catch (e) {
    notify.fromError(e)
  } finally {
    deleting.value = false
  }
}

const deletingStockId = ref<number | null>(null)

const handleDeleteStock = async (stock: Stock) => {
  if (!confirm('Вы уверены? Удалить будет невозможно, если сток не пуст.')) return

  const stockItemId = stock.stockItemId

  deletingStockId.value = stockItemId
  try {
    const response = await stockApi.deleteStock(warehouseId.value, stockItemId)

    if (response.successful) {
      notify.success('Успешно', 'Сток удалён')
      await fetchStock()
    } else {
      notify.fromApi(response)
    }
  } catch (error: any) {
    notify.fromError(error)
  } finally {
    deletingStockId.value = null
  }
}

const handleAddStock = async () => {
  selectedStock.value = null
  await nextTick()
  showMovementSideover.value = true
}

onMounted(() => {
  load()
  fetchStock()
})
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <div class="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ warehouse?.name || 'Склад' }}
        </h1>
        <p class="text-sm text-gray-500">Просмотр и редактирование данных склада</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" to="/dashboard/warehouse">
          К списку
        </UButton>
        <template v-if="warehouse && !errorMessage && !pending">
          <UButton v-if="!editMode" color="primary" icon="i-lucide-pencil" @click="startEdit">
            Редактировать
          </UButton>
        </template>
      </div>
    </div>

    <div v-if="pending">
      <UCard>
        <div class="p-4 space-y-3">
          <USkeleton class="h-6 w-1/2"/>
          <USkeleton class="h-10 w-full"/>
          <USkeleton class="h-6 w-1/3"/>
          <USkeleton class="h-10 w-full"/>
        </div>
      </UCard>
    </div>

    <div v-else-if="errorMessage"
         class="p-10 text-center bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <UIcon name="i-lucide-alert-circle" class="w-12 h-12 mx-auto text-red-500 mb-3"/>
      <div class="text-lg font-semibold">{{ errorMessage }}</div>
      <div class="text-sm text-gray-500 mt-1">Не удалось получить данные о складе.</div>
      <div class="flex items-center justify-center gap-2 mt-5">
        <UButton color="neutral" variant="outline" @click="load">
          Обновить данные
        </UButton>
        <UButton color="primary" to="/dashboard/warehouse">К списку складов</UButton>

      </div>
    </div>

    <div v-else-if="warehouse">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="font-semibold">Основные данные</div>
            <UBadge color="neutral" variant="soft">ID: {{ warehouse.id }}</UBadge>
          </div>
        </template>

        <div v-if="!editMode" class="space-y-4">
          <div>
            <div class="text-xs text-gray-500 uppercase tracking-wider">Название</div>
            <div class="text-base font-medium">{{ warehouse.name }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase tracking-wider">Адрес</div>
            <div class="text-base font-medium">{{ warehouse.address }}</div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div class="text-xs text-gray-500 uppercase tracking-wider">Создан</div>
              <div class="text-sm text-gray-700 dark:text-gray-300">{{ warehouse.createdAt || '—' }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 uppercase tracking-wider">Обновлён</div>
              <div class="text-sm text-gray-700 dark:text-gray-300">{{ warehouse.updatedAt || '—' }}</div>
            </div>
          </div>
        </div>

        <div v-else>
          <WarehouseForm
            :initial-value="{ name: warehouse.name, address: warehouse.address }"
            :pending="saving"
            :errors="errors"
            submit-label="Сохранить"
            @submit="save"
            @cancel="cancelEdit"
          />
        </div>
      </UCard>

      <UCard class="mt-6">
        <template #header>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="font-semibold">Остатки на складе</div>
              <UBadge color="neutral" variant="subtle" size="sm">{{ stockTotal }} поз.</UBadge>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UInput
                v-model="stockSearch"
                icon="i-lucide-search"
                placeholder="Поиск по SKU..."
                class="w-full md:w-64"
              />
              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-refresh-cw"
                :loading="stockPending"
                @click="fetchStock"
              />
              <UButton
                color="primary"
                icon="i-lucide-plus"
                @click="handleAddStock"
              >
                Добавить
              </UButton>
            </div>
          </div>
        </template>

        <div v-if="stockError" class="p-4">
          <UAlert title="Ошибка загрузки" :description="stockError" color="error" variant="soft"
                  icon="i-lucide-alert-circle"/>
        </div>
        <template v-else>
          <StockTable
            :data="stocks"
            :loading="stockPending"
            :total-count="stockTotal"
            :total-pages="stockTotalPages"
            :current-page="stockPage"
            :page-size="stockPageSize"
            :actions="actions"
            @page-change="stockPage = $event; fetchStock()"
          />
        </template>

        <template #footer v-if="stockTotal > stockPageSize">
          <div class="flex justify-end px-4 py-3">
            <UPagination
              v-model:page="stockPage"
              :items-per-page="stockPageSize"
              :total="stockTotal"
              :disabled="stockPending"
            />
          </div>
        </template>
      </UCard>

      <UCard class="mt-6">
        <template #header>
          <div class="font-semibold">История движений</div>
        </template>

        <StockMovementsTable
          :data="movements"
          :loading="movementsPending"
        />
      </UCard>

      <StockSideover
        v-model:isOpen="showMovementSideover"
        :selected-stock="selectedStock"
        :warehouse-id="warehouseId"
        :pending="movementFormPending"
        @submit="handleMovementSubmit"
        @cancel="selectedStock = null"
      />
    </div>
  </UContainer>
</template>
