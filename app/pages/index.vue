<script setup lang="ts">
definePageMeta({
  // middleware: 'authenticated',
  layout: 'default'
})

useSeoMeta({
  title: 'Панель управления',
  description: 'Управление складской системой StockFlow WMS'
})

const modules = [
  {
    label: 'Товары',
    description: 'Каталог товаров, SKU, карточки',
    icon: 'i-lucide-box',
    to: '/products',
    status: 'active'
  },
  {
    label: 'Склады',
    description: 'Список складов и их параметры',
    icon: 'i-lucide-warehouse',
    to: '/warehouses',
    status: 'active'
  },
  {
    label: 'Запасы',
    description: 'Остатки, партии, серийные номера',
    icon: 'i-lucide-layers',
    to: '/stock',
    status: 'active'
  },
  {
    label: 'Перемещения',
    description: 'Внутренние перемещения между складами',
    icon: 'i-lucide-arrow-left-right',
    to: '/transfers',
    status: 'active'
  },
  {
    label: 'Поставки',
    description: 'Приёмка товаров от поставщиков',
    icon: 'i-lucide-truck',
    to: '/supplies',
    status: 'active'
  },
  {
    label: 'Отгрузки',
    description: 'Отправка товаров клиентам',
    icon: 'i-lucide-package-check',
    to: '/shipments',
    status: 'active'
  }
]
</script>

<template>
  <div>
    <UPageHero
      title="StockFlow WMS"
      description="Управляйте товарами, складами, запасами и логистикой в единой системе. Простая, быстрая и удобная WMS для малого и среднего бизнеса."
      :links="[
        {
          label: 'Перейти в панель управления',
          to: '/dashboard',
          trailingIcon: 'i-lucide-arrow-right',
          size: 'xl'
        },
        {
          label: 'Документация',
          to: 'https://docs-template.nuxt.dev/',
          icon: 'i-lucide-book-open',
          size: 'xl',
          color: 'neutral',
          variant: 'subtle'
        }
      ]"
    />

    <UPageSection
      title="Основные модули"
      description="Быстрый доступ к ключевым разделам системы"
    >
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        <UCard
          v-for="item in modules"
          :key="item.label"
          :to="item.status === 'active' ? item.to : undefined"
          class="relative transition"
          :class="item.status !== 'active' ? 'opacity-60' : ''"
        >
          <UBadge
            v-if="item.status === 'soon'"
            color="neutral"
            variant="solid"
            class="absolute top-3 right-3"
          >
            Скоро
          </UBadge>

          <UBadge
            v-if="item.status === 'disabled'"
            color="error"
            variant="subtle"
            class="absolute top-3 right-3"
          >
            Недоступно
          </UBadge>

          <div class="flex items-start gap-4">
            <UIcon :name="item.icon" class="w-8 h-8 text-primary" />
            <div>
              <h3 class="text-lg font-semibold">{{ item.label }}</h3>
              <p class="text-sm text-muted">{{ item.description }}</p>
            </div>
          </div>
        </UCard>

      </div>
    </UPageSection>
  </div>
</template>
