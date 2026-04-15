<script setup lang="ts">
import type { Row } from '@tanstack/vue-table'
import ProductCard from '~/components/dashboard/catalog/ProductCard.vue'
import { useProductConverter } from '~/composables/catalog/useProductConverter'
import { useProductsList } from '~/composables/catalog/useProductList'
import { UButton, UDropdownMenu } from '#components'

const { productToState } = useProductConverter()

definePageMeta({
  layout: 'dashboard',
  title: 'Товары',
  breadcrumb: [
    { label: 'Каталог', to: '/dashboard/catalog' },
    { label: 'Товары', to: '/dashboard/catalog/products' }
  ]
})

const viewMode = ref<'table' | 'cards'>('table')

const notify = useNotify()
const {
  products,
  pagination,
  currentPage,
  loading,
  fetchProducts,
  goToPage,
  nextPage,
  prevPage,
  deleteProduct
} = useProductsList({ pageSize: 20 })

const deleting = ref<number | null>(null)

const handleDelete = async (id: number) => {
  if (!confirm('Вы уверены? Это действие невозможно отменить.')) return

  deleting.value = id
  try {
    await deleteProduct(id)

    notify.success('Успешно', 'Товар удалён')

    await fetchProducts(currentPage.value)
  } catch (error: any) {
    notify.error('Ошибка удаления', error?.message || 'Не удалось удалить товар')
  } finally {
    deleting.value = null
  }
}

const columns = [
  { accessorKey: 'id', header: 'ID', class: 'w-16' },
  { accessorKey: 'name', header: 'Название' },
  { accessorKey: 'skuCode', header: 'Код' },
  { accessorKey: 'skuName', header: 'SKU' },
  { accessorKey: 'createdAt', header: 'Создан' },
  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row }: { row: Row<any> }) => {
      const id = row.original.id as number

      const items = [
        {
          label: 'Открыть',
          onSelect: () => navigateTo(`/dashboard/catalog/products/${id}`)
        },
        {
          label: 'Удалить',
          disabled: deleting.value === id,
          onSelect: () => handleDelete(id)
        }
      ]

      return h(
        UDropdownMenu,
        { items, content: { align: 'end' } },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            variant: 'ghost',
            loading: deleting.value === id
          })
      )
    }
  }
]

onMounted(() => {
  fetchProducts(1).catch((error: any) => {
    notify.error('Ошибка загрузки', error?.message || 'Не удалось загрузить товары')
  })
})
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <div class="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Товары</h1>
        <p class="text-sm text-gray-500">Каталог товаров и SKU</p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-table"
          :variant="viewMode === 'table' ? 'solid' : 'ghost'"
          @click="viewMode = 'table'"
        />
        <UButton
          icon="i-lucide-grid"
          :variant="viewMode === 'cards' ? 'solid' : 'ghost'"
          @click="viewMode = 'cards'"
        />

        <UButton
          label="Новый товар"
          icon="i-lucide-plus"
          color="primary"
          to="/dashboard/catalog/products/new"
        />
      </div>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div class="text-xs text-gray-400">Найдено: {{ pagination.totalCount }}</div>
        </div>
      </template>

      <div v-if="loading" class="p-10 text-center">
        <div class="inline-block">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <p class="text-gray-500 mt-4">Загрузка товаров...</p>
      </div>

      <div v-else-if="products.length === 0" class="p-10 text-center">
        <UIcon name="i-lucide-inbox" class="w-14 h-14 mx-auto text-gray-300 mb-4" />
        <h3 class="text-lg font-semibold mb-2">Нет товаров</h3>
        <p class="text-gray-500 mb-6">Создайте первый товар в каталоге</p>
        <UButton label="Создать товар" icon="i-lucide-plus" to="/dashboard/catalog/products/new" />
      </div>

      <div v-else>
        <div v-if="viewMode === 'table'" class="w-full">
          <UTable :data="products" :columns="columns" class="w-full" />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="product in products" :key="product.id">
            <ProductCard
              :product="productToState(product)"
              :product-id="product.id"
              @view="navigateTo('/dashboard/catalog/products/' + product.id)"
            />
          </div>
        </div>
      </div>

      <template #footer v-if="!loading && pagination.totalPages > 1">
        <div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <div class="text-sm text-gray-500">
            Показано
            {{ (currentPage - 1) * pagination.pageSize + 1 }}–
            {{ Math.min(currentPage * pagination.pageSize, pagination.totalCount) }}
            из {{ pagination.totalCount }}
          </div>

          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              :disabled="currentPage === 1"
              @click="prevPage"
            />

            <div class="flex items-center gap-1">
              <UButton
                v-for="p in pagination.totalPages"
                :key="p"
                :label="String(p)"
                :color="currentPage === p ? 'primary' : 'neutral'"
                :variant="currentPage === p ? 'soft' : 'ghost'"
                size="sm"
                @click="goToPage(p)"
              />
            </div>

            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              :disabled="!pagination.hasMorePages"
              @click="nextPage"
            />
          </div>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
