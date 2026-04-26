<script setup lang="ts">
import type { Row } from "@tanstack/vue-table"
import { UButton, UDropdownMenu } from "#components"

interface TableAction {
  label: string
  icon?: string
  onSelect: (id: number) => void
  disabled?: (id: number) => boolean
}

const props = defineProps<{
  data: any[]
  actions: TableAction[]
  loading?: boolean
}>()

const columns = [
  { accessorKey: 'id', header: 'ID', class: 'w-16' },
  { accessorKey: 'name', header: 'Название' },
  { accessorKey: 'skuCode', header: 'Код' },
  { accessorKey: 'skuName', header: 'SKU' },
  { accessorKey: 'createdAt', header: 'Создан' },
  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row }: { row: Row<any> }) => {
      const id = row.original.id as number

      const items = props.actions.map(action => ({
        label: action.label,
        icon: action.icon,
        disabled: action.disabled?.(id),
        onSelect: () => action.onSelect(id)
      }))

      return h(
        UDropdownMenu,
        { items, content: { align: 'end' } },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            variant: 'ghost'
          })
      )
    }
  }
]
</script>

<template>
  <UTable :data="data" :columns="columns" :loading="loading" class="w-full" />
</template>
