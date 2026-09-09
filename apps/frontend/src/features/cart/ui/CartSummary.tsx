import type { Product } from '../../../types'
import { formatCents } from '../../../shared/lib/formatMoney'
import { selectItems, selectOriginalSubtotal } from '../model/cartSelectors'
import { useCartDispatch, useCartState } from '../model/useCart'

export function CartSummary({ products }: { products: readonly Product[] }) {
  const state = useCartState()
  const dispatch = useCartDispatch()
  const items = selectItems(state)
  const subtotal = selectOriginalSubtotal(state, products)
  const productById = new Map(products.map((p) => [p.id, p]))

  return (
    <section aria-label="Resumen del carrito">
      <h2>Carrito</h2>

      {items.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <ul>
          {items.map((item) => {
            const product = productById.get(item.productId)
            return (
              <li key={item.productId}>
                <span>{product?.name ?? item.productId}</span>
                <span> · Cantidad: {item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Reducir cantidad de ${product?.name ?? item.productId}`}
                  onClick={() => dispatch({ type: 'itemDecremented', productId: item.productId })}
                >
                  −
                </button>
                <button
                  type="button"
                  aria-label={`Eliminar ${product?.name ?? item.productId} del carrito`}
                  onClick={() => dispatch({ type: 'itemRemoved', productId: item.productId })}
                >
                  Eliminar
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p aria-live="polite">
        Subtotal provisional: <strong>{formatCents(subtotal)}</strong>
      </p>
      <p>El total definitivo se calcula al confirmar la compra.</p>
    </section>
  )
}
