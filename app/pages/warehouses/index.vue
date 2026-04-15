<script setup lang="ts">
definePageMeta({
  middleware: 'authenticated'
})

onMounted(() => {
  navigateTo('/dashboard/warehouse')
})
</script>

<template>
  <div />
</template>
