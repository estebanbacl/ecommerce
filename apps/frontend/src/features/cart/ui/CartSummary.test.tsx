import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { Product } from '../../../types'
import { CartProvider } from '../model/CartProvider'
import { useCartDispatch } from '../model/useCart'
import { CartSummary } from './CartSummary'

const products: Product[] = [{ id: 'p1', name: 'Teclado', unitPrice: 1000, currency: 'USD', category: 'TECHNOLOGY', stock: 5 }]

function AddButton() {
  const dispatch = useCartDispatch()
  return (
    <button type="button" onClick={() => dispatch({ type: 'itemAdded', productId: 'p1', knownStock: 5 })}>
      seed-add
    </button>
  )
}

function renderSummary() {
  return render(
    <CartProvider>
      <AddButton />
      <CartSummary products={products} />
    </CartProvider>,
  )
}

describe('CartSummary', () => {
  it('shows an empty message with zero subtotal', () => {
    renderSummary()
    expect(screen.getByText('El carrito está vacío.')).toBeInTheDocument()
  })

  it('updates the subtotal immediately after adding an item', async () => {
    renderSummary()
    await userEvent.click(screen.getByRole('button', { name: 'seed-add' }))

    expect(screen.getByText('Teclado')).toBeInTheDocument()
    const subtotalLabel = screen.getByText(/Subtotal provisional/)
    expect(subtotalLabel.parentElement?.textContent).toMatch(/10[,.]00/)
  })

  it('removes the line via the delete action', async () => {
    renderSummary()
    await userEvent.click(screen.getByRole('button', { name: 'seed-add' }))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar Teclado del carrito' }))

    expect(screen.getByText('El carrito está vacío.')).toBeInTheDocument()
  })
})
