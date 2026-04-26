export type StockMovementType = 'incoming' | 'outgoing' | 'adjustment' | 'transfer'

export type StockMovement = {
  id: number
  warehouseId: number
  stockItemId: number
  type: StockMovementType
  qty: number
  reason: string | null
  createdAt: string
}

export interface CreateStockMovementPayload {
  warehouseId: number
  stockItemId: number
  type: StockMovementType
  qty: number
  toWarehouseId?: number | null
  reason?: string
}
