export default defineNuxtRouteMiddleware((to) => {
  const { can, isSuperAdmin, isAuthenticated } = useAuth()

  if (!isAuthenticated.value) return navigateTo('/login')

  const requiredPermission = to.meta.permission as string

  if (isSuperAdmin.value) return

  if (requiredPermission === undefined) return

  if (!can(requiredPermission)) {
    return abortNavigation({
      statusCode: 403,
      statusMessage: `Упс, не пущу`,
      message: 'У вас нет права на доступ к этому ресурсу.'
    })
  }
})
