import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import type { Product, ProductState } from '~/types/product'
import { useProductConverter } from '~/composables/catalog/useProductConverter'

interface UseProductFormOptions {
  isEditMode?: boolean
  initialProduct?: Product
}

// Вспомогательная функция для очистки ссылок, безопасная для сервера (SSR)
const revokeSafe = (url: string) => {
  if (import.meta.client && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export function useProductForm(options: UseProductFormOptions = {}) {
  const isEditMode = ref(options.isEditMode || false)
  const { productToState } = useProductConverter()

  const state = reactive<ProductState>({
    name: '',
    sku: { code: '', name: '' },
    attributes: [],
    images: [],
    coverImageIndex: 0
  })

  const deletedImageIds = ref<number[]>([])

  const ensureCoverExists = () => {
    const hasCover = state.images.some(img => img.isCover)
    if (!hasCover && state.images.length > 0) {
      state.images.forEach(img => (img.isCover = false))
      state.images[0]!.isCover = true
      state.coverImageIndex = 0
      return
    }
    const idx = state.images.findIndex(img => img.isCover)
    state.coverImageIndex = idx >= 0 ? idx : 0
  }

  const initializeFromProduct = () => {
    if (options.initialProduct && isEditMode.value) {
      const converted = productToState(options.initialProduct)
      Object.assign(state, converted)
      ensureCoverExists()
    }
  }

  initializeFromProduct()

  // DIRTY CHECK
  const initialSnapshot = ref('')
  const makeSnapshot = () => {
    return JSON.stringify({
      name: state.name,
      sku: state.sku,
      attributes: state.attributes.map(a => ({ key: a.key, value: a.value })),
      images: state.images.map(img => ({
        id: img.id ?? null,
        isCover: img.isCover
      }))
    })
  }

  initialSnapshot.value = makeSnapshot()
  const isDirty = computed(() => makeSnapshot() !== initialSnapshot.value)

  // FILE UPLOAD
  const onFilesSelected = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return

      state.images.push({
        id: undefined,
        file,
        // Проверка на клиент, чтобы не упал SSR
        url: import.meta.client ? URL.createObjectURL(file) : '',
        isCover: state.images.length === 0 && !isEditMode.value,
        isNew: true
      })
    })
    ensureCoverExists()
  }

  const removeImage = (index: number) => {
    const image = state.images[index]
    if (!image) return

    revokeSafe(image.url)

    if (isEditMode.value && !image.isNew && image.id != null) {
      if (!deletedImageIds.value.includes(image.id)) {
        deletedImageIds.value.push(image.id)
      }
    }

    state.images.splice(index, 1)
    ensureCoverExists()
  }

  const setCoverImage = (index: number) => {
    state.images.forEach(img => (img.isCover = false))
    const image = state.images[index]
    if (image) {
      image.isCover = true
      state.coverImageIndex = index
    }
  }

  const addAttribute = () => state.attributes.push({ key: '', value: '' })
  const removeAttribute = (index: number) => state.attributes.splice(index, 1)

  const reset = () => {
    state.images.forEach(img => revokeSafe(img.url))
    state.name = ''
    state.sku = { code: '', name: '' }
    state.attributes = []
    state.images = []
    state.coverImageIndex = 0
    deletedImageIds.value = []
  }

  const getFormData = (): FormData => {
    const formData = new FormData()
    ensureCoverExists()

    const metadata = {
      name: state.name,
      skuCode: state.sku.code,
      skuName: state.sku.name,
      attributes: state.attributes.filter(a => a.key && a.value),
      coverIndex: state.images.findIndex(img => img.isCover)
    }

    formData.append('metadata', JSON.stringify(metadata))

    if (isEditMode.value) {
      const newImagesMetas = state.images
        .filter(img => img.isNew && img.file)
        .map(img => ({ isCover: img.isCover }))

      formData.append('newImagesMetadata', JSON.stringify(newImagesMetas))
      formData.append('deletedImageIds', JSON.stringify(deletedImageIds.value))

      state.images
        .filter(img => img.isNew && img.file)
        .forEach((img, idx) => {
          formData.append(`newImages[${idx}]`, img.file!)
        })
    } else {
      const imageMetadata = state.images
        .filter(img => img.file)
        .map(img => ({ isCover: img.isCover }))

      formData.append('imageMetadata', JSON.stringify(imageMetadata))
      state.images
        .filter(img => img.file)
        .forEach((img, idx) => {
          formData.append(`files[${idx}]`, img.file!)
        })
    }

    return formData
  }

  onBeforeUnmount(() => {
    state.images.forEach(img => revokeSafe(img.url))
  })

  return {
    state,
    deletedImageIds,
    isDirty,
    onFilesSelected,
    removeImage,
    setCoverImage,
    addAttribute,
    removeAttribute,
    reset,
    getFormData
  }
}

