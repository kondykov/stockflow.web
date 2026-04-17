export type StockMovementType = 'incoming' | 'outgoing' | 'adjustment'

export type StockMovement = {
  id: number
  warehouseId: number
  stockItemId: number
  type: StockMovementType
  qty: number
  reason: string | null
  createdAt: string
}

export type CreateStockMovementPayload = {
  warehouseId: number
  stockItemId: number
  type: StockMovementType
  qty: number
  reason?: string | null
}
