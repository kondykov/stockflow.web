<script setup lang="ts">
import ProductForm from '~/components/dashboard/catalog/ProductForm.vue'
import {Permission} from "~/types/permission";

definePageMeta({
  layout: 'dashboard',
  title: 'Каталог',
  middleware: 'rbac',
  permission: Permission.ProductCreate,
  breadcrumb: [
    { label: 'Каталог', to: '/dashboard/catalog' },
    { label: 'Продукты', to: '/dashboard/catalog/products' },
    { label: 'Новый продукт' }
  ]
})

const formRef = ref()

const handleSuccess = async () => {
  await navigateTo('/dashboard/catalog/products')
}

const handleCancel = () => {
  navigateTo('/dashboard/catalog')
}

const handleSubmit = () => {
  formRef.value?.submit()
}

</script>

<template>
  <div class="p-6 lg:p-10 max-w-[1400px] mx-auto">
    <div class="flex justify-end gap-3 mb-8">
      <UButton label="Отмена" color="neutral" variant="ghost" @click="handleCancel" />
      <UButton
        label="Создать товар"
        color="primary"
        icon="i-lucide-save"
        @click="handleSubmit"
      />
    </div>

    <ProductForm
      ref="formRef"
      mode="create"
      form-mode="editable"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>
