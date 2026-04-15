import type {Product, ProductState} from '~/types/product'

export function useProductConverter() {
  const productToState = (product: Product): ProductState => {
    const coverIndex = product.images.findIndex(img => img.isCover)

    const images = product.images.map(img => ({
      id: img.id,
      file: undefined as File | undefined,
      url: useImageUrl(img.url),
      isCover: img.isCover,
      isNew: false
    }))

    console.log('Converting product to state:', {
      productImagesCount: product.images.length,
      productImages: product.images.map(img => ({id: img.id, isCover: img.isCover})),
      stateImagesCount: images.length,
      stateImages: images.map(img => ({id: img.id, hasFile: !!img.file, isCover: img.isCover}))
    })

    return {
      name: product.name,
      sku: {
        code: product.skuCode,
        name: product.skuName
      },
      attributes: product.attributes,
      images,
      coverImageIndex: coverIndex >= 0 ? coverIndex : 0
    }
  }

  return {productToState}
}
