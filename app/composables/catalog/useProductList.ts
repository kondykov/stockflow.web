import { ref, computed } from 'vue'
import type { Product } from '~/types/product'

interface PaginationData {
  page: number
  perPage: number
  totalCount: number
  totalPages: number
  hasMorePages: boolean
  items: Product[]
}

interface UseProductsListOptions {
  pageSize?: number
}

export function useProductsList(options: UseProductsListOptions = {}) {
  const pageSize = options.pageSize || 10
  const currentPage = ref(1)
  const loading = ref(false)
  const products = ref<Product[]>([])

  const pagination = ref({
    page: 1,
    pageSize: pageSize,
    totalCount: 0,
    totalPages: 0,
    hasMorePages: false
  })

  const fetchProducts = async (page: number = 1) => {
    loading.value = true
    try {
      const response = await useApi<PaginationData>(
        '/api/catalog/product',
        {
          method: 'GET',
          query: {
            page,
            pageSize: pageSize
          }
        }
      )

      if (!response.successful) {
        throw new Error(response.message || 'Ошибка загрузки товаров')
      }

      const data = response.data as PaginationData

      products.value = data.items
      pagination.value = {
        page: data.page,
        pageSize: data.perPage,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        hasMorePages: data.hasMorePages
      }
      currentPage.value = page
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка загрузки товаров')
    } finally {
      loading.value = false
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      fetchProducts(page)
    }
  }

  const nextPage = () => {
    if (pagination.value.hasMorePages) {
      goToPage(currentPage.value + 1)
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      goToPage(currentPage.value - 1)
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      const response = await useApi('/api/catalog/product/' + id, {
        method: 'DELETE'
      })

      if (!response.successful) {
        throw new Error(response.message || 'Ошибка удаления')
      }

      await fetchProducts(currentPage.value)
      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  return {
    products: computed(() => products.value),
    pagination: computed(() => pagination.value),
    currentPage: computed(() => currentPage.value),
    loading: computed(() => loading.value),
    fetchProducts,
    goToPage,
    nextPage,
    prevPage,
    deleteProduct
  }
}
