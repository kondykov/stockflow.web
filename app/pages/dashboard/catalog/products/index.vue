<script setup lang="ts">
import ProductCard from "~/components/dashboard/catalog/ProductCard.vue";

const {productToState} = useProductConverter()

definePageMeta({
  layout: 'dashboard',
  title: 'Товары',
  breadcrumb: [
    {label: 'Каталог', to: '/dashboard/catalog'},
    {label: 'Товары', to: '/dashboard/catalog/products'}
  ]
})

const toast = useToast()
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
} = useProductsList({pageSize: 10})

const deleting = ref<number | null>(null)

onMounted(() => {
  fetchProducts(1).catch(error => {
    toast.add({
      title: 'Ошибка загрузки',
      description: error.message,
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  })
})

const handleDelete = async (id: number) => {
  if (!confirm('Вы уверены? Это действие невозможно отменить.')) return

  deleting.value = id
  try {
    await deleteProduct(id)

    toast.add({
      title: 'Успешно',
      description: 'Товар удалён',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Ошибка удаления',
      description: error.message,
      icon: 'i-lucide-x-circle',
      color: 'error'
    })
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="p-6 lg:p-10 max-w-[1400px] mx-auto">
    <!-- Заголовок и кнопка -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Товары</h1>
        <p class="text-gray-500 mt-1">Всего товаров: {{ pagination.totalCount }}</p>
      </div>
      <UButton
        label="Новый товар"
        icon="i-lucide-plus"
        color="primary"
        size="lg"
        to="/dashboard/catalog/products/new"
      />
    </div>

    <!-- Сетка товаров -->
    <div v-if="!loading && products.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          v-for="product in products"
          :key="product.id"
        >

          <ProductCard
            :product="productToState(product)"
            :product-id="product.id"
            @view="navigateTo('/dashboard/catalog/products/' + product.id)"
          >
            <template #actions/>
          </ProductCard>

        </div>
      </div>
    </div>

    <div v-else-if="!loading && products.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-inbox" class="w-16 h-16 mx-auto text-gray-300 mb-4"/>
      <h3 class="text-lg font-semibold mb-2">Нет товаров</h3>
      <p class="text-gray-500 mb-6">Создайте первый товар в каталоге</p>
      <UButton
        label="Создать товар"
        icon="i-lucide-plus"
        to="/dashboard/catalog/products/new"
      />
    </div>

    <!-- Загрузка -->
    <div v-else-if="loading" class="text-center py-12">
      <div class="inline-block">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      <p class="text-gray-500 mt-4">Загрузка товаров...</p>
    </div>

    <!-- Пагинация -->
    <div v-if="pagination.totalPages > 1"
         class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
      <div class="text-sm text-gray-500">
        Показано {{ (currentPage - 1) * pagination.perPage + 1 }}-{{
          Math.min(currentPage * pagination.perPage, pagination.totalCount)
        }}
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
            v-for="page in pagination.totalPages"
            :key="page"
            :label="String(page)"
            :color="currentPage === page ? 'primary' : 'neutral'"
            :variant="currentPage === page ? 'soft' : 'ghost'"
            size="sm"
            @click="goToPage(page)"
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
  </div>
</template>
