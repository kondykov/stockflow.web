<script setup lang="ts">
import type { Product, ProductState } from '~/types/product'
import ProductGallery from '~/components/dashboard/catalog/ProductGallery.vue'
import ProductBasicInfo from '~/components/dashboard/catalog/ProductBasicInfo.vue'
import ProductAttributes from '~/components/dashboard/catalog/ProductAttributes.vue'
import ProductCard from '~/components/dashboard/catalog/ProductCard.vue'
import ProductWMSInfo from '~/components/dashboard/catalog/ProductWMSInfo.vue'
import { useProductValidation } from '~/composables/catalog/useProductValidation'
import { useProductForm } from '~/composables/catalog/useProductForm'
import { useProductApi } from '~/composables/catalog/useProductApi'

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
}>()

const notify = useNotify()
const { validate, getFirstErrorMessage } = useProductValidation()

// Управление состоянием формы
const {
  state,
  onFilesSelected,
  removeImage,
  setCoverImage,
  addAttribute,
  removeAttribute,
  reset,
  getFormData
} = useProductForm({
  isEditMode: props.mode === 'edit',
  initialProduct: props.initialProduct
})

// API
const { createProduct, updateProduct } = useProductApi()
const isLoading = ref(false)

const isEditable = computed(() => props.formMode === 'editable')

const handleAttributeUpdate = (index: number, key: string, value: string) => {
  state.attributes[index] = { key, value }
}

const handleUpdateState = (updates: Partial<ProductState>) => {
  if ('name' in updates) state.name = updates.name || ''
  if ('sku' in updates) state.sku = updates.sku!
}

const onSubmit = async () => {
  if (!isEditable.value) return

  const validation = validate(state)
  if (!validation.success) {
    notify.error('Ошибка валидации', getFirstErrorMessage(validation))
    return
  }

  isLoading.value = true
  try {
    const formData = getFormData()
    let response

    if (props.mode === 'create') {
      response = await createProduct(formData)
    } else {
      response = await updateProduct(props.initialProduct!.id, formData)
    }

    if (!response.successful) {
      throw new Error(response.message || 'Ошибка при сохранении')
    }

    const action = props.mode === 'create' ? 'создан' : 'обновлён'
    notify.success(`Продукт успешно ${action}`, `${state.name} добавлен в каталог`)

    emit('success', response.data as Product)
    reset()
  } catch (error: any) {
    notify.error(
      `Ошибка ${props.mode === 'create' ? 'создания' : 'обновления'}`,
      error?.message || 'Не удалось сохранить продукт'
    )
  } finally {
    isLoading.value = false
  }
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
      <ProductWMSInfo :product="state" />
    </div>
  </div>
</template>
