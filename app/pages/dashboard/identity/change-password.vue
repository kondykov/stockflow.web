<script setup lang="ts">
import * as z from 'zod'

definePageMeta({
  layout: 'dashboard',
  title: 'Смена пароля',
  breadcrumb: [
    {label: 'Безопасность', to: '/dashboard/identity'},
    {label: 'Смена пароля'}
  ]
})

const {token} = useAuth()
const toast = useToast()
const pending = ref(false)
const form = ref()
const serverError = ref()

const schema = z.object({
  oldPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string().min(3, 'Не менее 3 символов'),
  newPasswordConfirmation: z.string()
}).refine((data) => data.newPassword === data.newPasswordConfirmation, {
  message: "Пароли не совпадают",
  path: ["newPasswordConfirmation"],
})

const fields = [
  {name: 'oldPassword', type: 'password', label: 'Текущий пароль', placeholder: '••••••••'},
  {name: 'newPassword', type: 'password', label: 'Новый пароль', placeholder: '••••••••'},
  {name: 'newPasswordConfirmation', type: 'password', label: 'Подтвердите новый пароль', placeholder: '••••••••'}
]

async function onSubmit(payload: any) {
  if (pending.value) return
  pending.value = true

  serverError.value = ''

  try {
    await useApi('/api/identity/change-password', {
      method: 'POST',
      body: payload.data
    })

    toast.add({ title: 'Пароль успешно изменен', color: 'success', icon: 'i-lucide-check' })

  } catch (err: any) {
    const status = err.statusCode ?? err.status

    if (status === 422) {
      const serverErrors = err.data?.data ?? err._data?.data ?? {}
      serverError.value = Object.values(serverErrors)[0] as string
      return
    }

    toast.add({
      title: 'Ошибка',
      description: err.data?.message ?? err._data?.message ?? 'Что-то пошло не так',
      color: 'error'
    })
  } finally {
    pending.value = false
  }
}


</script>

<template>
  <UDashboardPanel grow>
    <UContainer class="py-8 max-w-lg">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-key-round" class="w-5 h-5 text-primary"/>
            <span class="font-semibold">Обновление пароля</span>
          </div>
        </template>

        <UAuthForm
          ref="form"
          :fields="fields"
          :schema="schema"
          :loading="pending"
          title=""
          icon=""
          :submit="{ label: 'Сохранить изменения', size: 'md' }"
          @submit="onSubmit"
        >
          <template #validation>
            <UAlert
              v-if="serverError"
              color="error"
              icon="i-lucide-info"
              :title="serverError"
            />
          </template>
        </UAuthForm>
      </UCard>
    </UContainer>
  </UDashboardPanel>
</template>
