<script setup lang="ts">
import authenticated from "~/middleware/authenticated";
import {useAuth} from "~/composable/auth";

const auth = useAuth()

const user = auth.user
const isAdmin = computed(() => user.value?.isAdmin === true)
const isAuthenticated = computed(() => auth.isAuthenticated)

console.log(isAdmin.value, user.value)

const route = useRoute()

const items = computed(() => [{
  label: 'Docs',
  to: '/docs',
  active: route.path.startsWith('/docs')
}, {
  label: 'Pricing',
  to: '/pricing'
}, {
  label: 'Blog',
  to: '/blog'
}, {
  label: 'Changelog',
  to: '/changelog'
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      v-if="isAdmin"
    />

    <template #right>
      <UColorModeButton />

      <UButton
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        to="/login"
        class="lg:hidden"
        v-if="!authenticated"
      />

      <UButton
        label="Войти"
        color="neutral"
        variant="outline"
        to="/login"
        class="hidden lg:inline-flex"
        v-if="!isAuthenticated"
      />

      <UButton
        label="Зарегистрироваться"
        color="neutral"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        to="/register"
        v-if="!isAuthenticated"
      />

      <UButton
        label="Выйти"
        color="neutral"
        variant="outline"
        to="/logout"
        class="hidden lg:inline-flex"
        v-if="isAuthenticated"
      />
      <UButton
        label="Личный кабинет"
        color="neutral"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        to="/account"
        v-if="isAuthenticated"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <UButton
        label="Войти"
        color="neutral"
        variant="subtle"
        to="/login"
        block
        class="mb-3"
        v-if="!isAuthenticated"
      />
      <UButton
        label="Зарегистрироваться"
        color="neutral"
        to="/register"
        block
        v-if="!isAuthenticated"
      />

      <UButton
        label="Выйти"
        color="neutral"
        variant="subtle"
        to="/logout"
        block
        class="mb-3"
        v-if="isAuthenticated"
      />

      <UButton
        label="Личный кабинет"
        color="neutral"
        to="/account"
        block
        v-if="isAuthenticated"
      />

    </template>
  </UHeader>
</template>
