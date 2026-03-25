<script setup lang="ts">
</script>
<template>
  <div class="h-screen flex items-center justify-center px-4">
    <UColorModeButton class="absolute left-8 top-8 rounded-full z-10" />

    <UPageCard
      variant="subtle"
      class="max-w-sm w-full"
    >
      <slot />
    </UPageCard>
  </div>
</template>
