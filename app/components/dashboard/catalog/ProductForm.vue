<script setup lang="ts">
import type { Product, ProductState } from '~/types/product'
import ProductGallery from "~/components/dashboard/catalog/ProductGallery.vue"
import ProductBasicInfo from "~/components/dashboard/catalog/ProductBasicInfo.vue"
import ProductAttributes from "~/components/dashboard/catalog/ProductAttributes.vue"
import ProductCard from "~/components/dashboard/catalog/ProductCard.vue"
import ProductWMSInfo from "~/components/dashboard/catalog/ProductWMSInfo.vue"

// ✅ Определи интерфейс ДО defineProps
interface Props {
  mode?: 'create' | 'edit'
  formMode?: 'readonly' | 'editable'
  initialProduct?: Product
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  formMode: 'editable'
})

const emit = defineEmits<{
  success: [product: Product]
  cancel: []
  edit: []
}>()

const toast = useToast()
const { can } = useAuth()

const { state, onFilesSelected, removeImage, setCoverImage, addAttribute, removeAttribute, reset, getFormData } =
  useProductForm({
    isEditMode: props.mode === 'edit',
    initialProduct: props.initialProduct
  })

const { validate, getFirstErrorMessage } = useProductValidation()
const { productToState } = useProductConverter()
const productStatus = useProductStatus(computed(() => state))

const isEditable = computed(() => props.formMode === 'editable')
const canEditProduct = computed(() => can('product.edit'))

const handleAttributeUpdate = (index: number, key: string, value: string) => {
  state.attributes[index] = { key, value }
}

const handleUpdateState = (updates: Partial<ProductState>) => {
  Object.assign(state, updates)
}

const onSubmit = async () => {
  if (!isEditable.value) return

  const validation = validate(state)

  if (!validation.success) {
    const errorMessage = getFirstErrorMessage(validation)
    toast.add({
      title: 'Ошибка валидации',
      description: errorMessage,
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
    return
  }

  try {
    const url = props.mode === 'create'
      ? '/api/catalog/product'
      : `/api/catalog/product/${props.initialProduct?.id}`

    const method = props.mode === 'create' ? 'POST' : 'PUT'

    const response = await useApi<Product>(url, {
      method,
      body: getFormData()
    })

    if (!response.successful) {
      throw new Error(response.message as string)
    }

    const product = response.data as Product
    const action = props.mode === 'create' ? 'создан' : 'обновлён'

    toast.add({
      title: `Продукт успешно ${action}`,
      description: `${product.name} добавлен в каталог`,
      icon: 'i-lucide-check-circle',
      color: 'success'
    })

    emit('success', product)
    reset()
  } catch (error: any) {
    toast.add({
      title: `Ошибка ${props.mode === 'create' ? 'создания' : 'обновления'}`,
      description: error.message || 'Не удалось сохранить продукт',
      icon: 'i-lucide-x-circle',
      color: 'error'
    })
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleEdit = () => {
  if (!canEditProduct.value) return
  emit('edit')
}

defineExpose({
  submit: onSubmit
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <div class="lg:col-span-8 space-y-6">
      <ProductGallery
        :images="state.images"
        :cover-image-index="state.coverImageIndex"
        :mode="formMode"
        @set-cover="setCoverImage"
        @remove-image="removeImage"
        @upload-files="onFilesSelected"
      />

      <ProductBasicInfo
        :model-value="state"
        :mode="formMode"
        :disabled-fields="mode === 'edit' ? ['skuCode'] : []"
        @update:model-value="handleUpdateState"
      />

      <ProductAttributes
        :attributes="state.attributes"
        :mode="formMode"
        @add-attribute="addAttribute"
        @remove-attribute="removeAttribute"
        @update-attribute="handleAttributeUpdate"
      />
    </div>

    <div class="lg:col-span-4 lg:sticky lg:top-10 space-y-6">
      <ProductCard :product="state" />
      <ProductStatus :status="productStatus" />
      <ProductWMSInfo :product="state" />
    </div>
  </div>
</template>
