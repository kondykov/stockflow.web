<script setup lang="ts">
import type {NavigationMenuItem} from '@nuxt/ui'
import TeamsMenu from "~/components/dashboard/TeamsMenu.vue";
import UserMenu from "~/components/dashboard/UserMenu.vue";
import {Permission} from "~/types/permission";

const {can, isSuperAdmin} = useAuth()
const route = useRoute()
const toast = useToast()

const open = ref(false)

const navGroups = computed(() => {
  const rawLinks: NavigationMenuItem[][] = [
    [
      {
        label: 'Главная',
        icon: 'i-lucide-house',
        to: '/dashboard',
        onSelect: () => {
          open.value = false
        }
      },
      {
        label: 'Безопасность',
        icon: 'i-lucide-fingerprint',
        onSelect: () => {
          open.value = false
        },
        children: [
          {
            label: 'Пользователи',
            to: '/dashboard/identity/users',
            show: can(Permission.IdentityAccess),
            onSelect: () => {
              open.value = false
            },
          }, {
            label: 'Роли',
            to: '/dashboard/identity/rbac/roles',
            show: can(Permission.IdentityAccess),
            onSelect: () => {
              open.value = false
            },
          }, {
            label: 'Смена пароля',
            to: '/dashboard/identity/change-password',
            onSelect: () => {
              open.value = false
            },
          }, {
            label: 'Профиль',
            to: '/dashboard/identity/profile',
            onSelect: () => {
              open.value = false
            },
          }
        ]
      },
    ],
    [
      {
        label: 'Feedback',
        icon: 'i-lucide-message-circle',
        to: 'https://github.com/nuxt-ui-templates/dashboard',
        target: '_blank'
      },
      {
        label: 'Help & Support',
        icon: 'i-lucide-info',
        to: 'https://github.com/nuxt-ui-templates/dashboard',
        target: '_blank'
      }
    ]
  ]

  const filterLinks = (items: any[]): any[] => {
    return items
      .filter(item => item.show !== false)
      .map(item => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: filterLinks(item.children)
          }
        }
        return item
      })
      .filter(item => {
        return !(item.children && item.children.length === 0 && !item.to);
      })
  }

  return rawLinks.map(group => filterLinks(group)) as NavigationMenuItem[][]
})

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: navGroups.value.flat() as any[]
}, {
  id: 'code',
  label: 'Code',
  items: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }] as any[]
}])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') return

  toast.add({
    title: 'Мы используем куки для улучшения работы сайта.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Принять',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed"/>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default"/>

        <UNavigationMenu
          :collapsed="collapsed"
          :items="navGroups[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="navGroups[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed"/>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel grow>
      <UDashboardNavbar :title="route.meta.title">
        <template #left>
          <UBreadcrumb v-if="route.meta.breadcrumb" :items="route.meta.breadcrumb" class="ml-4"/>
        </template>

        <template #right>
          <slot name="navbar-right"/>
        </template>
      </UDashboardNavbar>

      <div class="flex-1 overflow-y-auto min-h-0">
        <slot/>
      </div>
    </UDashboardPanel>

    <UDashboardSearch :groups="groups"/>
  </UDashboardGroup>
</template>
