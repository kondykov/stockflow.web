import type {Permission} from "~/types/permission";

export interface PermissionOption {
  name: Permission
  label: string
}

export interface Role {
  id: number
  name: string
  permissions: PermissionOption[]
}

export interface User {
  id: number
  email: string
  username: string
  isAdmin: boolean
  rolesIds: number[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface UserDto {
  id: number
  email: string
  username: string
  isAdmin: boolean
  roles: string[]
  createdAt: string
  updatedAt: string
}
