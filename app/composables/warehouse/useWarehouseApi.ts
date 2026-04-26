import type {ApiResponse, PaginationResponse} from '~/types/apiResponse'
import type {CreateWarehousePayload, UpdateWarehousePayload, Warehouse} from '~/types/warehouse'

export function useWarehouseApi() {
  const createWarehouse = (payload: CreateWarehousePayload): Promise<ApiResponse<Warehouse>> => {
    return useApi<Warehouse>('/api/warehouse', {
      method: 'POST',
      body: payload
    })
  }

  const updateWarehouse = (id: number, payload: UpdateWarehousePayload): Promise<ApiResponse<Warehouse>> => {
    return useApi<Warehouse>(`/api/warehouse/${id}`, {
      method: 'PUT',
      body: payload
    })
  }

  const deleteWarehouse = (id: number): Promise<ApiResponse<null>> => {
    return useApi<null>(`/api/warehouse/${id}`, {
      method: 'DELETE'
    })
  }

  const getWarehouseById = (id: number): Promise<ApiResponse<Warehouse>> => {
    return useApi<Warehouse>(`/api/warehouse/${id}`, {
      method: 'GET'
    })
  }

  const getWarehouses = (params: {
    page?: number
    pageSize?: number
    perPage?: number
    search?: string
  } = {}): Promise<ApiResponse<PaginationResponse<Warehouse[]>>> => {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? params.perPage ?? 20

    return useApi<PaginationResponse<Warehouse[]>>('/api/warehouse/', {
      method: 'GET',
      query: {
        page,
        pageSize,
        perPage: pageSize,
        ...(params.search ? {search: params.search} : {})
      }
    })
  }

  return {
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseById,
    getWarehouses
  }
}
