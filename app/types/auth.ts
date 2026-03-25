export interface User {
  id: number
  name: string
  email: string
  isAdmin: boolean
  roles: string[]
  permissions: string[]
  createdAt: string,
  updatedAt: string,
}
