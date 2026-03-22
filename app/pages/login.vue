<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import {useAuth} from "~/composable/auth";

definePageMeta({
  middleware: 'guest'
})

const { login } = useAuth()
const toast = useToast()

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль слишком короткий')
})

const state = reactive({ email: '', password: '' })
const form = ref()
const pending = ref(false)

async function onSubmit(event: FormSubmitEvent<any>) {
  if (pending.value) return
  pending.value = true

  try {
    await login(state)
    toast.add({ title: 'Вход выполнен', color: 'success' })
  } catch (err: any) {
    if (err.statusCode === 401) {
      form.value.setErrors([{ path: 'password', message: 'Неверный логин или пароль' }])
    } else if (err.statusCode === 422) {
      const serverErrors = err.data?.errors?.map((e: any) => ({ path: e.property, message: e.message }))
      form.value.setErrors(serverErrors || [])
    } else {
      toast.add({ title: 'Ошибка сервера', description: err.data?.message, color: 'success' })
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
          <h2 class="text-2xl font-bold">С возвращением!</h2>
          <p class="text-sm text-muted">Введите данные для входа</p>
        </div>
      </template>

      <UForm ref="form" :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" icon="i-heroicons-envelope" class="w-full" />
        </UFormField>

        <UFormField label="Пароль" name="password">
          <UInput v-model="state.password" type="password" icon="i-heroicons-lock-closed" class="w-full" />
        </UFormField>

        <UButton type="submit" block :loading="pending">Войти</UButton>
      </UForm>
      <template #footer>
        <p class="text-xs text-center text-muted">
          Нет аккаунта? <NuxtLink to="/register" class="text-primary font-medium">Создать</NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>
