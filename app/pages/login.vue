<script setup lang="ts">
import * as z from 'zod'
import {useAuth} from "~/composable/auth";

definePageMeta({
  layout: 'auth'
})

const login = useAuth().login

useSeoMeta({
  title: 'Авторизация',
  description: 'С возвращением!'
})

const toast = useToast()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Введите свой email'
}, {
  name: 'password',
  label: 'Пароль',
  type: 'password' as const,
  placeholder: 'Введите пароль'
}]

const schema = z.object({
  email: z.email('Неверный email'),
  password: z.string().min(8, 'Необходимо не менее 8 символов')
})

type Schema = z.output<typeof schema>

const form = ref()
const pending = ref(false)

async function onSubmit(event: Schema) {
  if (pending.value) return
  pending.value = true

  try {
    await login(event.data)
    toast.add({ title: 'Вход выполнен', color: 'success' })
  } catch (err: any) {
    if (err.statusCode === 401) {
      form.value?.setErrors?.([{ path: 'password', message: 'Неверный логин или пароль' }])
    } else if (err.statusCode === 422) {
      const serverErrors = err.data?.errors?.map((e: any) => ({ path: e.property, message: e.message }))
      form.value?.setErrors?.(serverErrors || [])
    } else {
      toast.add({ title: 'Ошибка сервера', description: err.data?.message, color: 'success' })
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Вход"
    :submit="{ label: 'Войти' }"
    @submit="onSubmit"
  >
    <template #description>
      Нет аккаунта?
      <ULink to="/register" class="text-primary font-medium">
        Зарегистрируй
      </ULink>
      !
    </template>
  </UAuthForm>
</template>

