<script setup lang="ts">
import {useApi} from "~/composables/useApi";
import type {Row} from '@tanstack/vue-table'
import type {User, UserDto} from "~/types/auth";
import {UBadge, UButton, UDropdownMenu} from "#components";
import {Permission} from "~/types/permission";
import type {PaginationResponse} from "~/types/apiResponse";

const {roles, fetchRoles} = useAuth()

definePageMeta({
  layout: 'dashboard',
  middleware: 'rbac',
  permission: Permission.IdentityAccess,
  title: 'Пользователи',
  breadcrumb: [
    {label: 'Безопасность', to: '/dashboard/identity'},
    {label: 'Пользователи'}
  ]
})


//#region Table
const page = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const pending = ref(false)

const users = ref<User[]>([])
const totalCount = ref(0)

async function fetchUsers() {
  pending.value = true
  try {
    const response = await useApi<PaginationResponse<User[]>>('/api/identity/users', {
      query: {
        page: page.value,
        pageSize: pageSize.value,
        search: searchQuery.value
      }
    })

    if (response.successful) {
      users.value = response.data.items || []
      totalCount.value = response.data.totalCount || 0
    }
  } finally {
    pending.value = false
  }
}

watch(page, () => fetchUsers())

watch(searchQuery, () => {
  page.value = 1
  fetchUsers()
})

onMounted(async () => {
  await fetchRoles()
  await fetchUsers()
})

const getRoleById = (id: number) => roles.value.find(r => r.id === id)

const tableData = computed<UserDto[]>(() => {
  return users.value.map(u => ({
    id: u.id,
    email: u.email,
    isAdmin: u.isAdmin,
    roles: u.isAdmin ? ['ADMINISTRATOR'] : u.rolesIds.map(id => getRoleById(id)?.name || ''),
    username: u.username,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  }))
})

const columns = [
  {accessorKey: 'id', header: 'ID', class: 'w-16'},
  {accessorKey: 'email', header: 'Email'},
  {
    accessorKey: 'roles',
    header: 'Роли',
    cell: ({row}: { row: Row<UserDto> }) => {
      const roles = row.original.roles
      return h('div', {class: 'flex flex-wrap gap-1'},
        roles.map(role =>
          h(UBadge, {
            color: row.original.isAdmin ? 'warning' : 'primary',
            variant: 'soft',
            class: 'text-xs'
          }, () => role)
        )
      )
    }
  },
  {accessorKey: 'createdAt', header: 'Дата'},
  {
    accessorKey: 'actions',
    header: '',
    cell: ({row}: { row: Row<UserDto> }) => {
      const items = [{
        label: 'Открыть профиль',
        onSelect: () => navigateTo(`/dashboard/identity/users/${row.original.id}`)
      }]
      return h(UDropdownMenu, {items, content: {align: 'end'}}, () =>
        h(UButton, {icon: 'i-lucide-ellipsis-vertical', variant: 'ghost'})
      )
    }
  }
]

//#endregion

const stats = computed(() => [
  {label: 'Всего пользователей', value: totalCount.value, icon: 'i-lucide-users'},
  {
    label: 'Администраторы',
    value: users.value.filter(u => u.isAdmin).length,
    icon: 'i-lucide-shield'
  },
  {
    label: 'Новые за неделю',
    value: users.value.filter(u => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return u.createdAt && new Date(u.createdAt) > weekAgo
    }).length,
    icon: 'i-lucide-calendar'
  }
])
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Управление доступом</h1>
        <p class="text-sm text-gray-500">Список пользователей, системные роли и права доступа</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UCard v-for="item in stats" :key="item.label" :ui="{ body: { padding: 'p-4' } }">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-950 rounded-lg">
            <UIcon :name="item.icon" class="w-5 h-5 text-primary-500"/>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase font-semibold tracking-wider">{{ item.label }}</p>
            <p class="text-xl font-bold">{{ item.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Поиск..."
            class="max-w-xs"
          />
          <div>

            <span class="text-xs text-gray-400">Найдено: {{ totalCount }}</span>
          </div>
        </div>
      </template>

      <UTable
        :data="tableData"
        :columns="columns"
        :loading="pending"
        class="w-full"
      />

      <template #footer v-if="totalCount > pageSize">
        <div class="flex items-center justify-end px-4 py-3">
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="totalCount"
            :disabled="pending"
            show-last
            show-first
          />
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
