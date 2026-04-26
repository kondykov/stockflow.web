<script setup lang="ts">
import type { Product } from '~/types/product'
import ProductForm from '~/components/dashboard/catalog/ProductForm.vue'

const route = useRoute()
const router = useRouter()
const notify = useNotify()
const { can } = useAuth()

const id = computed(() => parseInt(route.params.id as string))

definePageMeta({
  layout: 'dashboard',
  title: 'Товар',
  middleware: 'rbac',
  permission: 'product.view',
  breadcrumb: [
    { label: 'Каталог', to: '/dashboard/catalog' },
    { label: 'Товары', to: '/dashboard/catalog/products' },
    { label: 'Просмотр товара' }
  ]
})

const product = ref<Product | null>(null)
const loading = ref(true)
const isEditMode = ref(false)
const formRef = ref()
const canEdit = computed(() => can('product.edit'))

const fetchProduct = async () => {
  loading.value = true
  try {
    const response = await useApi<Product>(
      `/api/catalog/product/${id.value}`,
      { method: 'GET' }
    )

    if (!response.successful) throw new Error(response.message || 'Ошибка загрузки товара')
    product.value = response.data as Product
  } catch (error: any) {
    notify.error('Ошибка загрузки', error?.message || 'Не удалось загрузить товар')
  } finally {
    loading.value = false
  }
}

const handleSuccess = (updatedProduct: Product) => {
  product.value = updatedProduct
  isEditMode.value = false
  notify.success('Успешно', 'Товар обновлён')
}

const handleCancel = () => {
  isEditMode.value = false
}

onMounted(() => {
  if (id.value > 0) fetchProduct()
})
</script>


<template>
  <div class="min-h-screen">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-500">Загрузка товара...</p>
      </div>
    </div>

    <div v-else-if="!product" class="flex items-center justify-center min-h-[60vh]">
      <UCard class="w-full max-w-md">
        <div class="text-center">
          <UIcon name="i-lucide-inbox" class="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 class="text-lg font-semibold mb-2">Товар не найден</h3>
          <p class="text-gray-500 mb-6">Запрашиваемый товар не существует</p>
          <UButton label="Назад" @click="router.back()" block />
        </div>
      </UCard>
    </div>

    <div v-else class="p-6 lg:p-10 max-w-[1400px] mx-auto">
      <div class="flex justify-end gap-3 mb-8">
        <UButton
          label="Назад"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          @click="isEditMode ? isEditMode = false : router.back()"
        />

        <UButton
          v-if="!isEditMode && canEdit"
          label="Редактировать"
          color="primary"
          icon="i-lucide-pen"
          @click="isEditMode = true"
        />

        <template v-else-if="isEditMode">
          <UButton
            label="Отмена"
            color="neutral"
            variant="soft"
            @click="handleCancel"
          />
          <UButton
            label="Сохранить"
            color="primary"
            icon="i-lucide-save"
            @click="formRef?.submit()"
          />
        </template>
      </div>

      <ProductForm
        ref="formRef"
        mode="edit"
        :form-mode="isEditMode ? 'editable' : 'readonly'"
        :initial-product="product"
        @success="handleSuccess"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
