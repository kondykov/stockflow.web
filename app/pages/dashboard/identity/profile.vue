<script setup lang="ts">
import { useApi } from "~/composables/useApi"
import { useAuth } from "~/composables/useAuth"

definePageMeta({
  layout: 'dashboard',
  middleware: 'authenticated',
  title: 'Мой профиль',
  breadcrumb: [
    { label: 'Безопасность', to: '/dashboard/identity' },
    { label: 'Профиль' }
  ]
})

const toast = useToast()
const { user, roles, fetchRoles } = useAuth()

const isRoleDialogOpen = ref(false)

const userRoleNames = computed(() => {
  if (!user.value) return []
  return user.value.rolesIds
    .map(id => roles.value.find(r => r.id === id)?.name)
    .filter(Boolean) as string[]
})

onMounted(async () => {
  await fetchRoles()
})

async function handleSaveRoles(selectedRoles: string[]) {
  if (!user.value?.id) {
    toast.add({
      title: 'Ошибка',
      description: 'Пользователь не найден',
      color: 'red'
    })
    return
  }

  try {
    const response = await useApi(`/api/identity/users/${user.value.id}/roles`, {
      method: 'POST',
      body: { roles: selectedRoles }
    })

    if (response.successful) {
      user.value.rolesIds = roles.value
        .filter(r => selectedRoles.includes(r.name))
        .map(r => r.id)

      isRoleDialogOpen.value = false

      toast.add({
        title: 'Успех',
        description: 'Роли обновлены',
        color: 'green'
      })
    } else {
      if (response.data && typeof response.data === 'object') {
        const errors = response.data as Record<string, any>
        Object.entries(errors).forEach(([field, message]) => {
          const msg = Array.isArray(message) ? message[0] : message
          toast.add({
            title: 'Ошибка',
            description: msg,
            color: 'red'
          })
        })
      } else {
        toast.add({
          title: 'Ошибка',
          description: response.message || 'Не удалось обновить роли',
          color: 'red'
        })
      }
    }
  } catch (error: any) {
    toast.add({
      title: 'Ошибка',
      description: error.message || 'Не удалось обновить роли',
      color: 'red'
    })
  }
}
</script>

<template>
  <UContainer class="py-8 space-y-10" v-if="user">

    <div class="flex items-center gap-6">
      <div class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <UIcon name="i-lucide-user" class="w-10 h-10 text-gray-500" />
      </div>

      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ user.username || user.email }}
        </h1>
        <p class="text-gray-500">Ваш профиль и системные роли</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div class="space-y-6 lg:col-span-2">

        <UCard :ui="{ body: { padding: 'p-6' } }">
          <template #header>
            <h2 class="text-lg font-semibold">Основная информация</h2>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Email</p>
              <p class="text-base font-medium">{{ user.email }}</p>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Имя пользователя</p>
              <p class="text-base font-medium">{{ user.username }}</p>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Тип</p>
              <p class="text-base font-medium">{{ user.type }}</p>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Создан</p>
              <p class="text-base font-medium">{{ user.createdAt }}</p>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Обновлён</p>
              <p class="text-base font-medium">{{ user.updatedAt }}</p>
            </div>

          </div>
        </UCard>

      </div>

      <div class="space-y-6">

        <UCard :ui="{ body: { padding: 'p-6' } }">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <h2 class="text-lg font-semibold">Роли</h2>
            </div>
          </template>

          <div class="flex flex-wrap gap-2" v-if="user.isAdmin">
            <UBadge color="warning" variant="soft">
              ADMINISTRATOR
            </UBadge>
          </div>

          <div class="flex flex-wrap gap-2" v-else-if="userRoleNames.length">
            <UBadge
              v-for="roleName in userRoleNames"
              :key="roleName"
              color="primary"
              variant="soft"
            >
              {{ roleName }}
            </UBadge>
          </div>

          <p v-else class="text-gray-500">
            Вам не назначены никакие роли
          </p>
        </UCard>

      </div>
    </div>

  </UContainer>
</template>
