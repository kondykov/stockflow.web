<script setup lang="ts">
import {useApi} from "~/composables/useApi";
import type {Row} from '@tanstack/vue-table'
import type {Role} from '~/types/auth'
import {UBadge, UButton, UDropdownMenu} from "#components";
import {Permission} from "~/types/permission";
import type {PaginationResponse} from "~/types/apiResponse";

definePageMeta({
  layout: 'dashboard',
  middleware: 'rbac',
  permission: Permission.IdentityAccess, // Или твой специфичный пермишен для ролей
  title: 'Роли системы',
  breadcrumb: [
    {label: 'Безопасность', to: '/dashboard/identity'},
    {label: 'Роли'}
  ]
})

//#region Table
const page = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const pending = ref(false)

const roles = ref<Role[]>([])
const totalCount = ref(0)

async function fetchRoles() {
  pending.value = true
  try {
    const response = await useApi<PaginationResponse<Role[]>>('/api/identity/rbac/roles', {
      query: {
        page: page.value,
        pageSize: pageSize.value,
        search: searchQuery.value
      }
    })

    if (response.successful) {
      roles.value = response.data.items || []
      totalCount.value = response.data.totalCount || 0
    }
  } finally {
    pending.value = false
  }
}

watch(page, () => fetchRoles())

watch(searchQuery, () => {
  page.value = 1
  fetchRoles()
})

onMounted(async () => {
  await fetchRoles()
})

const columns = [
  {accessorKey: 'id', header: 'ID', class: 'w-16'},
  {accessorKey: 'name', header: 'Название'},
  {
    accessorKey: 'permissions',
    header: 'Разрешения',
    cell: ({row}: { row: Row<Role> }) => {
      const perms = row.original.permissions || []
      const display = perms.slice(0, 3)
      const hasMore = perms.length > 3

      return h('div', {class: 'flex flex-wrap gap-1'}, [
        ...display.map(p => h(UBadge, {
          variant: 'soft',
          color: 'neutral',
          class: 'text-[10px] uppercase'
        }, () => p.name)),
        hasMore ? h(UBadge, {variant: 'outline', class: 'text-[10px]'}, () => `+${perms.length - 3}`) : null
      ])
    }
  },
  {accessorKey: 'createdAt', header: 'Дата создания'},
  {
    accessorKey: 'actions',
    header: '',
    cell: ({row}: { row: Row<Role> }) => {
      const items = [{
        label: 'Редактировать роль',
        onSelect: () => navigateTo(`/dashboard/identity/rbac/roles/${row.original.id}`)
      }]
      return h(UDropdownMenu, {items, content: {align: 'end'}}, () =>
        h(UButton, {icon: 'i-lucide-ellipsis-vertical', variant: 'ghost'})
      )
    }
  }
]
//#endregion
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Роли доступа</h1>
        <p class="text-sm text-gray-500">Управление системными ролями и их разрешениями</p>
      </div>
      <UButton
        label="Создать роль"
        icon="i-lucide-plus"
        color="primary"
        @click="navigateTo('/dashboard/identity/rbac/roles/new')"
      />
    </div>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="Поиск ролей..."
            class="max-w-xs"
          />
          <div>
            <span class="text-xs text-gray-400">Найдено: {{ totalCount }}</span>
          </div>
        </div>
      </template>

      <UTable
        :data="roles"
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
