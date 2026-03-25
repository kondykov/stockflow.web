import {useAuth} from "~/composable/auth";

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth()

  if (auth.token.value && !auth.user.value && !auth.isUserLoading.value) {
    await auth.fetchUser()
  }
})
