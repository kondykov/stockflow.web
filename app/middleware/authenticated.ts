export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  if (!token.value) {

    console.log('MW Auth: ТОКЕНА НЕТ -> Редирект на /login: ' + token.value)
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
