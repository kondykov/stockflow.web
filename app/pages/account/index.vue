<script setup lang="ts">
import { useAuth } from '~/composable/auth'

const auth = useAuth()
const user = auth.user
</script>

<template>
  <UContainer class="py-12">
    <div class="max-w-2xl mx-auto">
      <UCard>
        <div class="flex items-center gap-6">
          <UAvatar size="xl" icon="i-lucide-user" />

          <div>
            <h2 class="text-2xl font-semibold">{{ user?.email }}</h2>
            <p class="text-muted">Аккаунт создан: {{ user?.createdAt }}</p>
          </div>
        </div>

        <USeparator class="my-6" />

        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-muted">Администратор</span>
            <UBadge :color="user?.isAdmin ? 'primary' : 'neutral'">
              {{ user?.isAdmin ? 'Да' : 'Нет' }}
            </UBadge>
          </div>

          <div class="flex justify-between">
            <span class="text-muted">Роли</span>
            <div>
              <UBadge
                v-for="role in user?.roles"
                :key="role"
                class="mr-1"
                variant="subtle"
              >
                {{ role }}
              </UBadge>
            </div>
          </div>
        </div>

        <USeparator class="my-6" />

        <div class="space-y-3">
<!--          <UButton-->
<!--            label="Сменить пароль"-->
<!--            icon="i-lucide-key"-->
<!--            color="neutral"-->
<!--            variant="outline"-->
<!--            block-->
<!--            to="/account/change-password"-->
<!--          />-->

          <UButton
            label="Выйти"
            icon="i-lucide-log-out"
            color="error"
            block
            @click="auth.logout()"
          />
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
