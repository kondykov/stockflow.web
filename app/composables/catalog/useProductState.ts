import { reactive } from 'vue'
import type { Product, ProductState } from '~/types/product'
import { useProductConverter } from '~/composables/catalog/useProductConverter'

interface UseProductStateOptions {
  isEditMode?: boolean
  initialProduct?: Product
}

export function useProductState(options: UseProductStateOptions = {}) {
  const { productToState } = useProductConverter()

  const state = reactive<ProductState>({
    name: '',
    sku: { code: '', name: '' },
    attributes: [],
    images: [],
    coverImageIndex: 0
  })

  if (options.initialProduct && options.isEditMode) {
    const converted = productToState(options.initialProduct)
    Object.assign(state, converted)
  }

  const updateName = (value: string) => {
    state.name = value
  }

  const updateSku = (code: string, name: string) => {
    state.sku = { code, name }
  }

  const addAttribute = () => {
    state.attributes.push({ key: '', value: '' })
  }

  const removeAttribute = (index: number) => {
    state.attributes.splice(index, 1)
  }

  const updateAttribute = (index: number, key: string, value: string) => {
    state.attributes[index] = { key, value }
  }

  const reset = () => {

    state.name = ''
    state.sku = { code: '', name: '' }
    state.attributes = []
    state.images = []
    state.coverImageIndex = 0
  }

  return {
    state,
    updateName,
    updateSku,
    addAttribute,
    removeAttribute,
    updateAttribute,
    reset
  }
}

