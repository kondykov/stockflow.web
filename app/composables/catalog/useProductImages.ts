import { ref, computed, onBeforeUnmount } from 'vue'
import type { ProductImage } from '~/types/product'

interface UseProductImagesOptions {
  initialImages?: ProductImage[]
}

export function useProductImages(options: UseProductImagesOptions = {}) {
  const initialImages = options.initialImages || []

  const images = ref<ProductImage[]>(
    initialImages.map(img => ({
      ...img,
      id: img.id,
      file: undefined
    }))
  )

  const coverImageIndex = ref(
    initialImages.findIndex(img => img.isCover) || 0
  )

  const onFilesSelected = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) return

      images.value.push({
        file,
        url: URL.createObjectURL(file),
        isCover: images.value.length === 0 && initialImages.length === 0
      })
    })
  }

  const removeImage = (index: number) => {
    const image = images.value[index]
    if (image?.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url)
    }
    images.value.splice(index, 1)

    if (coverImageIndex.value >= images.value.length) {
      coverImageIndex.value = Math.max(0, images.value.length - 1)
    }

    const hasCover = images.value.some((img) => {
      return img.isCover
    })
    if (!hasCover && images.value.length > 0) {
      const imageAtIndex = images.value[coverImageIndex.value]
      if (imageAtIndex) {
        imageAtIndex.isCover = true
      }
    }
  }

  const setCoverImage = (index: number) => {
    images.value.forEach((img) => {
      img.isCover = false
    })
    const image = images.value[index]
    if (image) {
      image.isCover = true
    }
    coverImageIndex.value = index
  }

  const getNewImages = computed(() => images.value.filter((img) => {
    return img.file
  }))

  const getExistingImages = computed(() =>
    images.value.filter((img) => {
      return img.id && !img.file
    })
  )

  const getDeletedImageIds = computed(() =>
    initialImages
      .filter((img) => {
        return !images.value.find((i) => {
          return i.id === img.id
        })
      })
      .map((img) => {
        return img.id!
      })
      .filter((id) => {
        return Boolean(id)
      })
  )

  const reset = () => {
    images.value.forEach((img) => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url)
      }
    })
    images.value = initialImages.map((img) => {
      return {
        ...img,
        file: undefined
      }
    })
    coverImageIndex.value = initialImages.findIndex((img) => {
      return img.isCover
    }) || 0
  }

  const cleanup = () => {
    images.value.forEach((img) => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url)
      }
    })
  }

  onBeforeUnmount(() => cleanup())

  return {
    images,
    coverImageIndex,
    onFilesSelected,
    removeImage,
    setCoverImage,
    getNewImages,
    getExistingImages,
    getDeletedImageIds,
    reset,
    cleanup
  }
}

