<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  // middleware: 'authenticated',
  title: 'Главная'
})

const stats = [
  { name: 'Загрузка склада', value: '84%', status: 'high', color: 'text-orange-600' },
  { name: 'Заказов в очереди', value: '142', status: 'normal', color: 'text-blue-600' },
  { name: 'Приемка сегодня', value: '12 тонн', status: 'up', color: 'text-green-600' },
  { name: 'Ошибок комплектации', value: '0.2%', status: 'low', color: 'text-red-600' },
]

const recentActivities = [
  { id: 1, action: 'Приемка товара', item: 'Смартфоны X10', user: 'Иванов А.', time: '10 мин. назад' },
  { id: 2, action: 'Отгрузка', item: 'Ноутбуки Pro', user: 'Петров С.', time: '25 мин. назад' },
  { id: 3, action: 'Инвентаризация', item: 'Зона А-12', user: 'Сидоров К.', time: '1 час назад' },
]
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.name" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p class="text-sm text-gray-500 font-medium">{{ stat.name }}</p>
        <div class="flex items-end justify-between mt-2">
          <span class="text-2xl font-bold text-gray-800">{{ stat.value }}</span>
          <span :class="stat.color" class="text-xs font-semibold">
            {{ stat.status === 'up' ? '▲ 12%' : '' }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-700 mb-4">Занятость стеллажей по зонам</h3>
        <div class="space-y-4">
          <div v-for="i in 3" :key="i" class="space-y-1">
            <div class="flex justify-between text-xs">
              <span>Зона {{ ['A (Холодная)', 'B (Обычная)', 'C (Опасная)'][i-1] }}</span>
              <span>{{ [90, 45, 15][i-1] }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="bg-blue-500 h-2 rounded-full"
                :style="{ width: [90, 45, 15][i-1] + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-700 mb-4">Живая лента</h3>
        <div class="flow-root">
          <ul role="list" class="-mb-8">
            <li v-for="(activity, idx) in recentActivities" :key="activity.id" class="relative pb-8">
              <span v-if="idx !== recentActivities.length - 1" class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"></span>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center ring-8 ring-white">
                    <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </span>
                </div>
                <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p class="text-sm text-gray-500">{{ activity.action }}: <span class="font-medium text-gray-900">{{ activity.item }}</span></p>
                    <p class="text-xs text-gray-400">{{ activity.user }}</p>
                  </div>
                  <div class="whitespace-nowrap text-right text-xs text-gray-400">
                    {{ activity.time }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

<!--    <div class="flex gap-3">-->
<!--      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">-->
<!--        + Принять поставку-->
<!--      </button>-->
<!--      <button class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">-->
<!--        Сканировать ШК-->
<!--      </button>-->
<!--    </div>-->
  </div>
</template>
