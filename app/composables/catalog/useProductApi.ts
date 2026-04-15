import type { Product } from '~/types/product'
import type { ApiResponse } from '~/types/apiResponse'

export function useProductApi() {
  const createProduct = async (formData: FormData): Promise<ApiResponse<Product>> => {
    return await useApi<Product>('/api/catalog/product', {
      method: 'POST',
      body: formData
    })
  }

  const updateProduct = async (id: number, formData: FormData): Promise<ApiResponse<Product>> => {
    return await useApi<Product>(`/api/catalog/product/${id}`, {
      method: 'PUT',
      body: formData
    })
  }

  return {
    createProduct,
    updateProduct
  }
}
