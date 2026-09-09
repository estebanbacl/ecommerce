export type Currency = 'USD'
export type Category = 'TECHNOLOGY' | 'HOME' | 'BOOKS'

export interface Product {
  id: string
  name: string
  /** Integer cents. Never a float. */
  unitPrice: number
  currency: Currency
  category: Category
  stock: number
}
