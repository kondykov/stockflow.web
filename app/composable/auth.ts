export const useAuth = () => {
  const user = useState<any>('auth_user', () => null)
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24,
    watch: true,
    path: '/'
  })

  const fetchUser = async () => {
    if (!token.value) return
    try {
      const response = await $fetch<any>('/api/identity/user-data', {
        headers: { Authorization: `Bearer ${token.value}` }
      })

      if (response.successful) {
        user.value = response.data
      }
    } catch (e) {
      user.value = null
      token.value = null
    }
  }

  const login = async (credentials: any) => {
    const response = await $fetch<any>('/api/identity/login', {
      method: 'POST',
      body: credentials
    })

    if (response.successful && response.data?.token) {
      token.value = response.data.token

      await fetchUser()

      return navigateTo('/')
    } else {
      throw { statusCode: 401, data: response }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    return navigateTo('/login')
  }


  return {
    user,
    token,
    login,
    logout,
    fetchUser,
    isAuthenticated: computed(() => !!token.value)
  }
}
