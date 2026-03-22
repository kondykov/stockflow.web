<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  middleware: 'guest'
})

const toast = useToast()
const pending = ref(false)
const form = ref()

const schema = z.object({
  name: z.string().min(2, 'Введите ваше имя'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
  passwordConfirmation: z.string()
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Пароли не совпадают",
  path: ["passwordConfirmation"]
})

const state = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirmation: ''
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  if (pending.value) return
  pending.value = true

  try {
    const response = await $fetch<any>('/api/identity/register', {
      method: 'POST',
      body: {
        name: state.name,
        email: state.email,
        password: state.password,
        passwordConfirmation: state.passwordConfirmation
      }
    })

    if (response.successful) {
      toast.add({ title: 'Аккаунт создан!', description: 'Теперь вы можете войти', color: 'success' })
      return navigateTo('/login')
    }
  } catch (err: any) {
    const data = err.data

    if (err.statusCode === 422 && data?.errors) {
      const serverErrors = data.errors.map((e: any) => ({
        path: e.property,
        message: e.message
      }))
      form.value.setErrors(serverErrors)
    } else {
      toast.add({
        title: 'Ошибка регистрации',
        description: data?.message || 'Что-то пошло не так',
        color: 'error'
      })
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UContainer class="flex items-center justify-center min-h-[calc(100vh-200px)]">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold">Создать аккаунт</h2>
          <p class="text-sm text-muted">Присоединяйтесь к StockFlow ERP</p>
        </div>
      </template>

      <UForm ref="form" :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
        <UFormField label="Имя" name="name">
          <UInput v-model="state.name" placeholder="Иван Иванов" icon="i-heroicons-user" class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email">
          <UInput v-model="state.email" placeholder="mail@example.com" icon="i-heroicons-envelope" class="w-full" />
        </UFormField>

        <UFormField label="Пароль" name="password">
          <UInput v-model="state.password" type="password" icon="i-heroicons-lock-closed" class="w-full" />
        </UFormField>

        <UFormField label="Подтверждение пароля" name="passwordConfirmation">
          <UInput v-model="state.passwordConfirmation" type="password" icon="i-heroicons-check-badge" class="w-full" />
        </UFormField>

        <UButton type="submit" block :loading="pending">Зарегистрироваться</UButton>
      </UForm>

      <template #footer>
        <p class="text-xs text-center text-muted">
          Уже есть аккаунт? <NuxtLink to="/login" class="text-primary font-medium">Войти</NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>
