import { ref, reactive, onBeforeUnmount } from 'vue'
import type { Product, ProductState } from '~/types/product'

interface UseProductFormOptions {
  isEditMode?: boolean
  initialProduct?: Product
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

  // Инициализация из initialProduct
  const initializeFromProduct = () => {
    if (options.initialProduct && isEditMode.value) {
      const converted = productToState(options.initialProduct)
      Object.assign(state, {
        name: converted.name,
        sku: converted.sku,
        attributes: converted.attributes,
        images: [...converted.images],
        coverImageIndex: converted.coverImageIndex
      })
    }
  }

  initializeFromProduct()

  const onFilesSelected = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return

      state.images.push({
        file,
        url: URL.createObjectURL(file),
        isCover: state.images.length === 0 && !isEditMode.value
      })
    })
  }

  const removeImage = (index: number) => {
    const image = state.images[index]

    if (image) {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url)
      }

      if (image.id && isEditMode.value && !deletedImageIds.value.includes(image.id)) {
        deletedImageIds.value.push(image.id)
      }
    }

    state.images.splice(index, 1)

    if (state.coverImageIndex >= state.images.length) {
      state.coverImageIndex = Math.max(0, state.images.length - 1)
    }

    const hasCover = state.images.some(img => img.isCover)
    if (!hasCover && state.images.length > 0) {
      const imageAtIndex = state.images[state.coverImageIndex]
      if (imageAtIndex) {
        imageAtIndex.isCover = true
      }
    }
  }

  const setCoverImage = (index: number) => {
    state.images.forEach(img => {
      img.isCover = false
    })
    const image = state.images[index]
    if (image) {
      image.isCover = true
    }
    state.coverImageIndex = index
  }

  const addAttribute = () => {
    state.attributes.push({ key: '', value: '' })
  }

  const removeAttribute = (index: number) => {
    state.attributes.splice(index, 1)
  }

  const reset = () => {
    state.name = ''
    state.sku = { code: '', name: '' }
    state.attributes = []
    state.images.forEach(img => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url)
      }
    })
    state.images = []
    state.coverImageIndex = 0
    deletedImageIds.value = []
  }

  const getFormData = (): FormData => {
    const formData = new FormData()

    // ✅ Метаданные в JSON - ВСЕГДА отправляй!
    const metadata = {
      name: state.name,
      sku: {
        code: state.sku.code,
        name: state.sku.name
      },
      attributes: state.attributes.filter(a => a.key && a.value)
    }

    formData.append('metadata', JSON.stringify(metadata))

    if (isEditMode.value) {
      // Редактирование
      const newImages = state.images
        .filter(img => img.file)
        .map(img => ({
          isCover: img.isCover
        }))

      const existingImages = state.images
        .filter(img => img.id && !img.file)
        .map(img => ({
          id: img.id,
          isCover: img.isCover
        }))

      formData.append('newImagesMetadata', JSON.stringify(newImages))
      formData.append('existingImages', JSON.stringify(existingImages))
      formData.append('deletedImageIds', JSON.stringify(deletedImageIds.value))

      // ✅ Новые файлы отдельно
      const newImageFiles = state.images.filter(img => img.file)
      newImageFiles.forEach((img, idx) => {
        if (img.file) {
          formData.append(`newImages[${idx}]`, img.file)
        }
      })
    } else {
      // Создание
      const imageMetadata = state.images
        .filter(img => img.file)
        .map((img, idx) => ({
          index: idx,
          isCover: img.isCover
        }))

      formData.append('imageMetadata', JSON.stringify(imageMetadata))

      // ✅ Файлы отдельно
      const imagesToUpload = state.images.filter(img => img.file)
      imagesToUpload.forEach((img, idx) => {
        if (img.file) {
          formData.append(`files[${idx}]`, img.file)
        }
      })
    }

    return formData
  }

  onBeforeUnmount(() => {
    state.images.forEach(img => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url)
      }
    })
  })

  return {
    state,
    deletedImageIds,
    onFilesSelected,
    removeImage,
    setCoverImage,
    addAttribute,
    removeAttribute,
    reset,
    getFormData
  }
}
