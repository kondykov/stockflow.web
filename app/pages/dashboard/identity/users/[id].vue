<script setup lang="ts">
import {useApi} from "~/composables/useApi"
import {useAuth} from "~/composables/useAuth"
import type {User} from "~/types/auth"
import {Permission} from "~/types/permission";
import type {ApiResponse, ValidationError} from "~/types/apiResponse";
import RoleManagerDialog from "~/components/modals/RoleManagerDialog.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: ['authenticated', 'rbac'],
  permission: Permission.IdentityAccess,
  title: 'Профиль',
  breadcrumb: [
    {label: 'Безопасность', to: '/dashboard/identity'},
    {label: 'Пользователи', to: '/dashboard/identity/users'},
    {label: 'Профиль'}
  ]
})

const toast = useToast()
const route = useRoute()
const userId = Number(route.params.id)

const {roles, fetchRoles} = useAuth()

const response = await useApi<User>(`/api/identity/users/${userId}`)
const user = response.data

onMounted(() => fetchRoles())

async function saveRoles(newRoles: string[]) {
  await useApi('/api/identity/rbac/role/batch-update', {
    method: 'POST',
    body: {
      userId: userId,
      roles: newRoles
    }
  }).then(response => {
    if (response.successful) {
      toast.add({
        title: 'Роли обновлены',
        description: `Роли пользователя были успешно обновлены.`,
        color: 'success'
      })
    }
  }).catch((error) => {

    error = error.data as ApiResponse<ValidationError>

    toast.add({
      title: 'Ошибка',
      description: `${Object.entries(error.data)
        .map(([field, message]) => {
          return Array.isArray(message) ? message[0] : message
        })
        .join('. ')}`,
      color: 'error'
    })
  })

  user.rolesIds = roles.value
    .filter(r => newRoles.includes(r.name))
    .map(r => r.id)
}
</script>

<template>
  <UContainer class="py-8 space-y-10">

    <div class="flex items-center gap-6">
      <div class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <UIcon name="i-lucide-user" class="w-10 h-10 text-gray-500"/>
      </div>

      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ user?.username || user?.email }}
        </h1>
        <p class="text-gray-500">Профиль пользователя и системные роли</p>
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
              <p class="text-base font-medium">{{ user?.email }}</p>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Имя пользователя</p>
              <p class="text-base font-medium">{{ user?.username }}</p>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Тип</p>
              <p class="text-base font-medium">{{ user?.type }}</p>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Создан</p>
              <p class="text-base font-medium">{{ user?.createdAt }}</p>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Обновлён</p>
              <p class="text-base font-medium">{{ user?.updatedAt }}</p>
            </div>

          </div>
        </UCard>

      </div>

      <div class="space-y-6">

        <UCard :ui="{ body: { padding: 'p-6' } }">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <h2 class="text-lg font-semibold">Роли</h2>

              <RoleManagerDialog
                :model-value="true"
                :user-roles="user?.rolesIds.map(id => roles.find(r => r.id === id)?.name) || []"
                :all-roles="roles"
                title="Управление ролями пользователя"
                @save="saveRoles"
              />
            </div>
          </template>

          <div class="flex flex-wrap gap-2" v-if="user.isAdmin">
            <UBadge
              color="warning"
              variant="soft"
            >
              ADMINISTRATOR
            </UBadge>
          </div>
          <div class="flex flex-wrap gap-2" v-if="!user.isAdmin">
            <UBadge
              v-for="roleId in user?.rolesIds"
              :key="roleId"
              color="primary"
              variant="soft"
            >
              {{ roles.find(r => r.id === roleId)?.name }}
            </UBadge>

            <p v-if="!user?.rolesIds?.length" class="text-gray-500">
              Нет назначенных ролей
            </p>
          </div>
        </UCard>

      </div>
    </div>

  </UContainer>
</template>
