import type {Role, User} from '~/types/auth'
import type {ApiResponse, PaginationResponse} from "~/types/apiResponse";

export const useAuth = () => {


  const route = useRoute()

  const user = useState<User | null>('auth_user', () => null)
  const roles = useState<Role[]>('auth_roles_list', () => [])

  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24,
    watch: true,
    path: '/'
  })
  const isUserLoading = useState<boolean>('auth_loading', () => false)

  // -----------------------------
  // FETCH USER
  // -----------------------------

  const fetchUser = async () => {
    if (!token.value) return

    isUserLoading.value = true

    try {
      const response = await $fetch<any>('/api/identity/user-data', {
        headers: {Authorization: `Bearer ${token.value}`}
      })

      if (response.successful) {
        user.value = response.data as User
      }
    } catch {
      user.value = null
      token.value = null
    } finally {
      isUserLoading.value = false
    }
  }

  // -----------------------------
  // FETCH ROLES
  // -----------------------------

  const fetchRoles = async () => {
    if (roles.value.length > 0 || !token.value) return roles.value

    try {
      const response = await useApi<PaginationResponse<Role[]>>('/api/identity/rbac/roles')

      if (response.successful) {
        roles.value = response.data.items
      }

      return roles.value
    } catch (e) {
      console.error('Failed to fetch roles:', e)
      return []
    }
  }


  // -----------------------------
  // LOGIN
  // -----------------------------
  const login = async (credentials: any) => {
    const response = await $fetch<ApiResponse<any>>('/api/identity/login', {
      method: 'POST',
      body: credentials
    })

    if (response.successful && response.data?.token) {
      token.value = response.data.token

      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log(response.data, token)

      await fetchRoles()
      await fetchUser()

      const redirectTo = (route.query.redirect as string) || '/'
      return navigateTo(redirectTo)
    }

    throw {statusCode: 401, data: response}
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    user.value = null
    token.value = null
    return navigateTo('/login')
  }

  // -----------------------------
  // RBAC
  // -----------------------------
  const isSuperAdmin = computed(() =>
    user.value?.isAdmin === true
  )

  const userPermissions = computed(() => {
    if (isSuperAdmin.value) return []
    if (!user.value || roles.value.length === 0) return []

    const currentRoles = roles.value.filter(r => user.value!.rolesIds.includes(r.id))

    const perms = currentRoles.flatMap(r => r.permissions.map(p => p.name))
    return [...new Set(perms)]
  })

  const can = (permission: string) => {
    if (isSuperAdmin.value) return true
    return userPermissions.value.includes(permission as any)
  }

  const canAny = (permissions: string[]) => {
    if (isSuperAdmin.value) return true
    return permissions.some(p => userPermissions.value.includes(p as any))
  }

  const canAll = (permissions: string[]) => {
    if (isSuperAdmin.value) return true
    return permissions.every(p => userPermissions.value.includes(p as any))
  }

  return {
    user,
    token,
    login,
    logout,
    fetchUser,

    isAuthenticated: computed(() => !!token.value),
    isUserLoading,

    // RBAC
    fetchRoles,
    roles,
    isSuperAdmin,
    can,
    canAny,
    canAll
  }
}
