<script setup lang="ts">
import type {Row} from '@tanstack/vue-table'
import type {Warehouse} from '~/types/warehouse'
import {UButton, UDropdownMenu} from '#components'

const props = defineProps<{
  data: Warehouse[]
  loading?: boolean
}>()

const emit = defineEmits<{
  open: [id: number]
}>()

const columns = [
  {accessorKey: 'id', header: 'ID', class: 'w-16'},
  {accessorKey: 'name', header: 'Название'},
  {accessorKey: 'address', header: 'Адрес'},
  {accessorKey: 'createdAt', header: 'Создан'},
  {
    accessorKey: 'actions',
    header: '',
    cell: ({row}: { row: Row<Warehouse> }) => {
      const id = row.original.id

      const items = [
        {
          label: 'Открыть',
          disabled: !id,
          onSelect: () => {
            if (!id) return
            emit('open', id)
          }
        }
      ]

      return h(
        UDropdownMenu,
        {items, content: {align: 'end'}},
        () => h(UButton, {icon: 'i-lucide-ellipsis-vertical', variant: 'ghost'})
      )
    }
  }
]

console.log(props.data)
</script>

<template>
  <UTable
    :data="data"
    :columns="columns"
    :loading="loading"
    class="w-full"
  />
</template>
