import type {User} from '~/types/auth'

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null)

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
  // LOGIN
  // -----------------------------
  const login = async (credentials: any) => {
    const response = await $fetch<any>('/api/identity/login', {
      method: 'POST',
      body: credentials
    })

    if (response.successful && response.data?.token) {
      token.value = response.data.token
      await fetchUser()
      return navigateTo('/')
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

  const hasRole = (role: string) => {
    if (isSuperAdmin.value) return true
    return user.value?.roles.includes(role) ?? false
  }

  const can = (permission: string) => {
    if (isSuperAdmin.value) return true
    return user.value?.permissions?.includes(permission) ?? false
  }

  const canAny = (permissions: string[]) => {
    if (isSuperAdmin.value) return true
    return permissions.some(p => user.value?.permissions.includes(p))
  }

  const canAll = (permissions: string[]) => {
    if (isSuperAdmin.value) return true
    return permissions.every(p => user.value?.permissions.includes(p))
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
    isSuperAdmin,
    hasRole,
    can,
    canAny,
    canAll
  }
}
