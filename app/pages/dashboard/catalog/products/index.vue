<script setup lang="ts">
import ProductCard from '~/components/dashboard/catalog/ProductCard.vue'
import {useProductConverter} from '~/composables/catalog/useProductConverter'
import {useProductsList} from '~/composables/catalog/useProductList'
import {UButton} from '#components'
import ProductsTable from "~/components/dashboard/catalog/ProductsTable.vue";
import CPagination from "~/components/common/CPagination.vue";

const {productToState} = useProductConverter()

definePageMeta({
  layout: 'dashboard',
  title: 'Товары',
  breadcrumb: [
    {label: 'Каталог', to: '/dashboard/catalog'},
    {label: 'Товары', to: '/dashboard/catalog/products'}
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
} = useProductsList({pageSize: 21})

watch(currentPage, (newPage) => {
  fetchProducts(newPage)
})


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
        <UIcon name="i-lucide-inbox" class="w-14 h-14 mx-auto text-gray-300 mb-4"/>
        <h3 class="text-lg font-semibold mb-2">Нет товаров</h3>
        <p class="text-gray-500 mb-6">Создайте первый товар в каталоге</p>
        <UButton label="Создать товар" icon="i-lucide-plus" to="/dashboard/catalog/products/new"/>
      </div>

      <div v-else>
        <div v-if="viewMode === 'table'" class="w-full">
          <ProductsTable
            :data="products"
            :loading="loading"
            :actions="[
              {
                label: 'Открыть',
                onSelect: (id) => navigateTo(`/dashboard/catalog/products/${id}`)
              },
            ]"
          />
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
        <UPagination
          v-model:page="currentPage"
          :items-per-page="pagination.pageSize"
          :total="pagination.totalCount"
          :disabled="loading"
        />
      </template>
    </UCard>
  </UContainer>
</template>
