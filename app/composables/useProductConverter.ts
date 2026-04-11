import type { Product, ProductState } from '~/types/product'

export function useProductConverter() {
  const productToState = (product: Product): ProductState => {
    const coverIndex = product.images.findIndex(img => img.isCover)

    return {
      name: product.name,
      sku: {
        code: product.skuCode,
        name: product.skuName
      },
      attributes: product.attributes,
      images: product.images.map(img => ({
        id: img.id,
        url: useImageUrl(img.url),
        isCover: img.isCover
      })),
      coverImageIndex: coverIndex >= 0 ? coverIndex : 0
    }
  }

  return { productToState }
}
