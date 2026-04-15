<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  title: 'Каталог',
})

onMounted(() => {
  navigateTo('/dashboard/catalog/products')
})
</script>
