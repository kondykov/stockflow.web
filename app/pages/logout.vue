<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { onMounted } from "vue";

definePageMeta({
  middleware: 'authenticated'
})

const { logout } = useAuth();

onMounted(async () => {
  await logout();
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen space-y-4">
    <UIcon
      name="i-heroicons-arrow-path"
      class="w-10 h-10 animate-spin text-primary"
    />

    <span class="text-gray-500 font-medium text-sm">
      Завершение сессии...
    </span>
  </div>
</template>
