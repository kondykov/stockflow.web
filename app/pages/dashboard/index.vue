<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'authenticated',
  title: 'Главная'
})

const stats = [
  {label: 'Загрузка склада', value: '84%', icon: 'i-heroicons-circle-stack', color: 'orange'},
  {label: 'Заказов на сборку', value: '42', icon: 'i-heroicons-clipboard-document-list', color: 'blue'},
  {label: 'Принято сегодня', value: '1,240 ед.', icon: 'i-heroicons-truck', color: 'green'},
  {label: 'Просрочено отгрузок', value: '3', icon: 'i-heroicons-exclamation-triangle', color: 'red'}
]

const transactions = [
  {id: 'TRX-9402', item: 'Подшипник качения 202', type: 'Приход', qty: 500, status: 'completed'},
  {id: 'TRX-9401', item: 'Масло моторное 5W30', type: 'Расход', qty: 24, status: 'processing'},
  {id: 'TRX-9400', item: 'Фильтр воздушный AF-10', type: 'Приход', qty: 100, status: 'completed'},
  {id: 'TRX-9399', item: 'Ремень ГРМ зубчатый', type: 'Расход', qty: 12, status: 'failed'}
]

const columns = [
  {
    accessorKey: 'id',
    label: 'ID'
  },
  {
    accessorKey: 'item',
    label: 'Товар'
  },
  {
    accessorKey: 'qty',
    label: 'Кол-во',
    sortable: true
  },
  {
    accessorKey: 'status',
    label: 'Статус'
  }
]
</script>

<template>
  <div class="flex flex-col gap-6 p-4">
    <!-- Сетка KPI -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center gap-4">
          <UAvatar
            :icon="stat.icon"
            :ui="{ background: `bg-${stat.color}-50 dark:bg-${stat.color}-950` }"
            :chip-color="stat.color"
            size="md"
          />
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">{{ stat.label }}</p>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Таблица последних движений -->
      <UCard class="lg:col-span-2" title="Последние движения ТМЦ">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6">Последние операции</h3>
            <UButton color="success" variant="ghost" icon="i-heroicons-arrow-right" to="/inventory">Все операции</UButton>
          </div>
        </template>

        <UTable :rows="transactions" :columns="columns">
          <template #status-data="{ row }">
            <UBadge
              :color="row.status === 'completed' ? 'success' : row.status === 'processing' ? 'warning' : 'error'"
              variant="subtle"
              size="xs"
            >
              {{ row.status }}
            </UBadge>
          </template>
        </UTable>
      </UCard>

      <!-- Зоны склада (Прогресс бары) -->
      <UCard>
        <template #header>
          <h3 class="text-base font-semibold leading-6">Заполнение зон</h3>
        </template>
        <div class="space-y-6">
          <div v-for="(zone, idx) in ['A (Мезонин)', 'B (Стеллажи)', 'C (Крупногабарит)']" :key="idx">
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium">{{ zone }}</span>
              <span class="text-sm text-gray-500">{{ [85, 42, 92][idx] }}%</span>
            </div>
            <UProgress :value="[85, 42, 92][idx]" :color="[85, 42, 92][idx] > 90 ? 'errors' : 'info'"/>
          </div>

          <!--          <UDivider label="Быстрые действия" />-->

          <div class="grid grid-cols-2 gap-2">
            <UButton icon="i-heroicons-qr-code" variant="soft" block>Приёмка</UButton>
            <UButton icon="i-heroicons-magnifying-glass" variant="soft" block>Поиск</UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
