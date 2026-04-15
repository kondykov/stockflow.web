export type Warehouse = {
  id: number | null
  userId: number
  name: string
  address: string
  createdAt: string | null
  updatedAt: string | null
}

export type CreateWarehousePayload = {
  name: string
  address: string
}

export type UpdateWarehousePayload = {
  name: string
  address: string
}
