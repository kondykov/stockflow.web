import * as z from 'zod'
import type { ProductState } from '~/types/product'

export function useProductValidation() {
  const schema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    sku: z.object({
      code: z.string().min(1, 'Код SKU обязателен'),
      name: z.string().min(1, 'Название SKU обязательно')
    })
  })

  const validate = (state: ProductState) => {
    return schema.safeParse({
      name: state.name,
      sku: state.sku
    })
  }

  const getFirstErrorMessage = (validation: ReturnType<typeof validate>) => {
    if (validation.success) return null

    // @ts-ignore
    const firstError = validation.error.errors[0]
    return firstError?.message || 'Ошибка валидации'
  }

  return { validate, schema, getFirstErrorMessage }
}
