<script setup lang="ts">
import {useApi} from "~/composables/useApi";
import type {PermissionOption, Role} from "~/types/auth";
import {Permission} from "~/types/permission";

const route = useRoute();
const toast = useToast();
const roleId = route.params.id;

definePageMeta({
  layout: 'dashboard',
  middleware: 'rbac',
  permission: Permission.IdentityAccess,
  breadcrumb: [
    {label: 'Безопасность', to: '/dashboard/identity'},
    {label: 'Роли', to: '/dashboard/identity/rbac/roles'},
    {label: 'Редактирование роли'}
  ]
});

//#region State
const pending = ref(false);
const saving = ref(false);

const roleName = ref('');
const selectedPermissions = ref<string[]>([]);
const allPermissions = ref<PermissionOption[]>([]);
//#endregion

//#region Logic
async function loadData() {
  pending.value = true;
  try {
    const permsRes = await useApi<PermissionOption[]>('/api/identity/rbac/permissions');
    if (permsRes.successful) {
      allPermissions.value = permsRes.data;
    }

    const roleRes = await useApi<Role>(`/api/identity/rbac/roles/${roleId}`);
    if (roleRes.successful) {
      roleName.value = roleRes.data.name;
      selectedPermissions.value = roleRes.data.permissions.map(p => p.name);
    }
  } finally {
    pending.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const response = await useApi(`/api/identity/rbac/roles/${roleId}`, {
      method: 'PUT',
      body: {
        name: roleName.value,
        permissions: selectedPermissions.value
      }
    });

    if (response.successful) {
      toast.add({title: 'Успешно', description: 'Роль обновлена', color: 'success'});
      await navigateTo('/dashboard/identity/rbac/roles');
    }
  } finally {
    saving.value = false;
  }
}

const groupedPermissions = computed(() => {
  const groups: Record<string, PermissionOption[]> = {};
  allPermissions.value.forEach(p => {
    const groupName = p.name.split('.')[0] || 'Системные';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(p);
  });
  return groups;
});

const togglePermission = (name: string, active: boolean) => {
  if (active) {
    if (!selectedPermissions.value.includes(name)) {
      selectedPermissions.value.push(name);
    }
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(p => p !== name);
  }
};

const scrollToGroup = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const offset = 100;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

onMounted(() => loadData());
//#endregion
</script>

<template>
  <UContainer class="py-6 space-y-6">
    <!-- Header: Стандартный размер -->
    <div
      class="flex items-center justify-between gap-4 bg-white dark:bg-gray-900 sticky top-0 z-20 py-4 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-4">

        <h1 class="text-2xl font-bold">Роль: {{ roleName || '...' }}</h1>
        <UBadge variant="soft" size="md" color="primary">{{ selectedPermissions.length }} разрешений</UBadge>
      </div>
      <div class="flex gap-3">
        <UButton
          label="Сохранить"
          icon="i-lucide-save"
          size="md"
          :loading="saving"
          @click="handleSave"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 space-y-6">
          <UCard>
            <UFormField label="Название роли" description="Укажите понятное имя для роли">
              <UInput v-model="roleName" placeholder="Напр: Модератор" size="md"/>
            </UFormField>
          </UCard>

          <UCard :ui="{ body: { padding: 'p-4' } }">
            <h4 class="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">Разделы</h4>
            <div class="flex flex-col gap-1">
              <UButton
                v-for="(_, group) in groupedPermissions"
                :key="group"
                :label="group"
                variant="ghost"
                color="neutral"
                block
                class="justify-start uppercase text-xs font-semibold"
                @click="scrollToGroup(`group-${group}`)"
              />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Permissions Grid -->
      <div class="lg:col-span-3">
        <div v-if="pending" class="space-y-6">
          <USkeleton v-for="i in 3" :key="i" class="h-48 w-full"/>
        </div>

        <div v-else class="space-y-12">
          <div
            v-for="(perms, group) in groupedPermissions"
            :id="`group-${group}`"
            :key="group"
            class="space-y-4"
          >
            <!-- Group Header -->
            <div class="flex items-center gap-4 sticky top-22 bg-white dark:bg-gray-900 z-10 py-2">
              <h2 class="text-sm font-black uppercase tracking-[0.2em] text-primary">{{ group }}</h2>
              <div class="h-px grow bg-gray-200 dark:bg-gray-800"></div>
              <span class="text-xs font-medium text-gray-400">{{ perms.length }} доступно</span>
            </div>

            <!-- Grid: 2-3 колонки для нормальной читаемости -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <UCard
                v-for="perm in perms"
                :key="perm.name"
                :ui="{
                  body: { padding: 'p-4' },
                  base: selectedPermissions.includes(perm.name) ? 'ring-2 ring-primary-500' : ''
                }"
              >
                <div class="flex items-start gap-4">
                  <USwitch
                    :model-value="selectedPermissions.includes(perm.name)"
                    @update:model-value="(val) => togglePermission(perm.name, val)"
                    class="mt-1"
                  />
                  <div class="flex flex-col min-w-0">
                    <span class="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">
                      {{ perm.label || perm.name }}
                    </span>
                    <span class="text-[10px] text-gray-500 font-mono break-all opacity-80">
                      {{ perm.name }}
                    </span>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
