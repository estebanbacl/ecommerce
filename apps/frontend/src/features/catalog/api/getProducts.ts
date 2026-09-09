import { request } from '../../../shared/api/httpClient'
import { productsResponseSchema } from '../../../shared/api/schemas'
import type { Product } from '../../../types'

export async function getProducts(signal?: AbortSignal): Promise<readonly Product[]> {
  const { products } = await request('/api/products', {
    method: 'GET',
    schema: productsResponseSchema,
    signal,
  })
  return products
}
