<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Регистрация',
  description: 'Создайте аккаунт в StockFlow ERP'
})

const toast = useToast()
const pending = ref(false)

const fields = [
  {
    name: 'name',
    type: 'text' as const,
    label: 'Имя',
    placeholder: 'Иван Иванов'
  },
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'mail@example.com'
  },
  {
    name: 'password',
    type: 'password' as const,
    label: 'Пароль',
    placeholder: 'Введите пароль'
  },
  {
    name: 'passwordConfirmation',
    type: 'password' as const,
    label: 'Подтверждение пароля',
    placeholder: 'Повторите пароль'
  }
]

const schema = z.object({
  name: z.string().min(2, 'Введите ваше имя'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
  passwordConfirmation: z.string()
}).refine((s) => s.password === s.passwordConfirmation, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirmation']
})

type Schema = z.output<typeof schema>

async function onSubmit(event: Schema) {
  if (pending.value) return
  pending.value = true

  console.log(event.data)

  try {
    const response = await $fetch('/api/identity/register', {
      method: 'POST',
      body: event.data
    })

    if (response.successful) {
      toast.add({
        title: 'Аккаунт создан!',
        description: 'Теперь вы можете войти',
        color: 'success'
      })

      return navigateTo('/login')
    }
  } catch (err: any) {
    const data = err.data

    if (err.statusCode === 422 && data?.errors) {
      toast.add({
        title: 'Ошибка',
        description: data.errors[0]?.message || 'Некорректные данные',
        color: 'error'
      })
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
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Создать аккаунт"
    :submit="{ label: 'Зарегистрироваться', loading: pending }"
    @submit="onSubmit"
  >
    <template #description>
      Уже есть аккаунт?
      <ULink to="/login" class="text-primary font-medium">
        Войти
      </ULink>
      .
    </template>
  </UAuthForm>
</template>
