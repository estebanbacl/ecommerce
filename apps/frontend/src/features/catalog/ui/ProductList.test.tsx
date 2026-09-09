import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Product } from '../../../types'
import { CartProvider } from '../../cart/model/CartProvider'
import { ProductList } from './ProductList'
import type { ProductsState } from '../model/useProducts'

const products: Product[] = [
  { id: 'p1', name: 'Teclado', unitPrice: 1000, currency: 'USD', category: 'TECHNOLOGY', stock: 1 },
]

function renderWithCart(state: ProductsState) {
  return render(
    <CartProvider>
      <ProductList state={state} onRetry={() => {}} />
    </CartProvider>,
  )
}

describe('ProductList', () => {
  it('shows a loading indicator', () => {
    renderWithCart({ status: 'loading' })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows an error with a retry action', async () => {
    const onRetry = vi.fn()
    render(
      <CartProvider>
        <ProductList
          state={{ status: 'error', error: { code: 'NETWORK_ERROR', message: 'boom' } }}
          onRetry={onRetry}
        />
      </CartProvider>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('boom')
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders the catalog and disables Add once stock is exhausted by the cart', async () => {
    renderWithCart({ status: 'success', data: products })

    const addButton = screen.getByRole('button', { name: 'Agregar Teclado al carrito' })
    expect(addButton).toBeEnabled()

    await userEvent.click(addButton)

    expect(addButton).toBeDisabled()
  })
})
