import type {PaginationResponse} from '~/types/apiResponse'
import type {Stock} from '~/types/stock'
import type {CreateStockMovementPayload, StockMovement, StockMovementType} from '~/types/stockMovement'

export function useStockApi() {
  const getStock = (warehouseId: number, page = 1, pageSize = 20, search = '') =>
    useApi<PaginationResponse<Stock[]>>(`/api/warehouse/${warehouseId}/stock`, {
      method: 'GET', query: {page, pageSize, search}
    })

  const getMovements = (warehouseId: number, params: { page?: number } = {}) =>
    useApi<PaginationResponse<StockMovement[]>>(`/api/warehouse/${warehouseId}/stock/movements`, {
      method: 'GET', query: {page: params.page ?? 1, pageSize: 20}
    })

  const incoming = (wId: number, body: CreateStockMovementPayload) => useApi<Stock>(`/api/warehouse/${wId}/stock/incoming`, {
    method: 'POST',
    body
  })
  const outgoing = (wId: number, body: CreateStockMovementPayload) => useApi<Stock>(`/api/warehouse/${wId}/stock/outgoing`, {
    method: 'PATCH',
    body
  })
  const adjustment = (wId: number, body: CreateStockMovementPayload) => useApi<Stock>(`/api/warehouse/${wId}/stock/adjust`, {
    method: 'PATCH',
    body
  })
  const transfer = (wId: number, body: CreateStockMovementPayload) => useApi<Stock>(`/api/warehouse/${wId}/stock/transfer`, {
    method: 'POST',
    body
  })

  const sendMovement = (warehouseId: number, payload: CreateStockMovementPayload) => {
    const actions: Record<StockMovementType, Function> = {incoming, outgoing, adjustment, transfer}
    return actions[payload.type](warehouseId, payload)
  }

  const deleteStock = (warehouseId: number, stockItemId: number) =>
    useApi(`/api/warehouse/${warehouseId}/stock/${stockItemId}`, {
      method: 'DELETE'
    })

  return {
    getStock,
    deleteStock,
    getMovements,
    sendMovement,
  }
}
