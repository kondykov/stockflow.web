export interface ProductAttribute {
  key: string
  value: string
}

export interface ProductImage {
  id?: number
  file?: File
  url: string
  isCover: boolean
}

export interface ProductSKU {
  code: string
  name: string
}

export interface ProductState {
  name: string
  sku: ProductSKU
  attributes: ProductAttribute[]
  images: ProductImage[]
  coverImageIndex: number
}

export interface Product {
  id: number
  name: string
  skuCode: string
  skuName: string
  attributes: ProductAttribute[]
  images: Array<{
    id: number
    url: string
    isCover: boolean
  }>
  createdAt: string | null
  updatedAt: string | null
}

export interface ProductStatus {
  label: string
  color: 'green' | 'yellow' | 'orange' | 'gray'
  icon: string
  percent: number
  message: string
}
