import type { ApiResponse, PaginatedResponse } from '~/types/apiResponse'
import type { Stock } from '~/types/stock'
import type {
  StockMovement,
  CreateStockMovementPayload
} from '~/types/stockMovement'

export function useStockApi() {
  const getStock = (warehouseId: number) =>
    useApi<PaginatedResponse<Stock[]>>(`/api/warehouse/${warehouseId}/stock`, {
      method: 'GET'
    })

  const getMovements = (
    warehouseId: number,
    params: {
      page?: number
      pageSize?: number
      perPage?: number
    } = {}
  ) => {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? params.perPage ?? 20

    return useApi<PaginatedResponse<StockMovement>>(
      `/api/warehouse/${warehouseId}/stock/movements`,
      {
        method: 'GET',
        query: {
          page,
          pageSize,
          perPage: pageSize
        }
      }
    )
  }

  const incoming = (payload: CreateStockMovementPayload) =>
    useApi<StockMovement>('/api/warehouse/stock/incoming', {
      method: 'POST',
      body: payload
    })

  const outgoing = (payload: CreateStockMovementPayload) =>
    useApi<StockMovement>('/api/warehouse/stock/outgoing', {
      method: 'POST',
      body: payload
    })

  const adjust = (payload: CreateStockMovementPayload) =>
    useApi<StockMovement>('/api/warehouse/stock/adjustment', {
      method: 'POST',
      body: payload
    })

  return {
    getStock,
    getMovements,
    incoming,
    outgoing,
    adjust
  }
}
