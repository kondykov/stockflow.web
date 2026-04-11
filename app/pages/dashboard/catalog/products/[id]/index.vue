<script setup lang="ts">
import type { Product } from '~/types/product'
import ProductForm from "~/components/dashboard/catalog/ProductForm.vue";

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { can } = useAuth()

const id = computed(() => parseInt(route.params.id as string))

definePageMeta({
  layout: 'dashboard',
  title: 'Товар',
  middleware: 'rbac',
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
  product.value = null

  try {
    const response = await useApi<Product>(
      `/api/catalog/product/${id.value}`,
      { method: 'GET' }
    )

    if (!response.successful) {
      throw new Error(response.message || 'Ошибка загрузки товара')
    }

    product.value = response.data as Product
  } catch (error: any) {
    toast.add({
      title: 'Ошибка загрузки',
      description: error.message,
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!id.value || id.value <= 0) {
    loading.value = false
    return
  }

  await fetchProduct()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Загрузка - показываем пока loading = true -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-500">Загрузка товара...</p>
      </div>
    </div>

    <!-- Товар не найден - показываем когда loading = false и product = null -->
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

    <!-- Содержимое товара - показываем когда loading = false и product != null -->
    <div v-else class="p-6 lg:p-10 max-w-[1400px] mx-auto">
      <!-- Toolbar -->
      <div class="flex justify-end gap-3 mb-8">
        <UButton
          label="Назад"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          @click="isEditMode ? isEditMode = false : router.back()"
        />

        <!-- Режим просмотра -->
        <UButton
          v-if="!isEditMode && canEdit"
          label="Редактировать"
          color="primary"
          icon="i-lucide-pen"
          @click="isEditMode = true"
        />

        <!-- Режим редактирования -->
        <template v-else-if="isEditMode">
          <UButton
            label="Отмена"
            color="neutral"
            variant="soft"
            @click="isEditMode = false"
          />
          <UButton
            label="Сохранить"
            color="primary"
            icon="i-lucide-save"
            @click="formRef?.submit()"
          />
        </template>
      </div>

      <!-- Одна форма с динамичным режимом -->
      <ProductForm
        ref="formRef"
        mode="edit"
        :form-mode="isEditMode ? 'editable' : 'readonly'"
        :initial-product="product"
        @success="(updatedProduct) => {
          product = updatedProduct
          isEditMode = false
          toast.add({
            title: 'Успешно',
            description: 'Товар обновлён',
            icon: 'i-lucide-check-circle',
            color: 'success'
          })
        }"
        @cancel="isEditMode = false"
      />
    </div>
  </div>
</template>
