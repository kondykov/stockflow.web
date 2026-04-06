<script setup lang="ts">
import type { Role } from "~/types/auth"

const props = defineProps<{
  modelValue: boolean
  userRoles: string[]
  allRoles: Role[]
  title?: string
}>()

const emit = defineEmits(["update:modelValue", "save"])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v)
})

const selectedRoles = ref<string[]>([])

watch(() => props.userRoles, (newRoles) => {
  selectedRoles.value = [...newRoles]
}, { immediate: true })

const handleSave = () => {
  emit("save", selectedRoles.value)
  isOpen.value = false
}

const toggleRole = (roleName: string) => {
  const index = selectedRoles.value.indexOf(roleName)
  if (index > -1) {
    selectedRoles.value.splice(index, 1)
  } else {
    selectedRoles.value.push(roleName)
  }
}
</script>

<template>
  <UModal v-model="isOpen" title="Управление ролями">
    <template #default>
      <UButton label="Управление ролями" />
    </template>

    <template #body>
      <div class="p-4 space-y-2">
        <div
          v-for="role in allRoles"
          :key="role.id"
          class="flex items-center justify-between p-3 rounded-lg border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ role.name }}
            </span>
            <span class="text-[10px] text-gray-400 uppercase tracking-tight">
              ID: {{ role.id }}
            </span>
          </div>

          <USwitch
            :model-value="selectedRoles.includes(role.name)"
            @update:model-value="toggleRole(role.name)"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 py-3">
        <UButton variant="ghost" color="neutral" @click="isOpen = false">Отменить</UButton>
        <UButton color="primary" @click="handleSave">Подтвердить</UButton>
      </div>
    </template>
  </UModal>
</template>
