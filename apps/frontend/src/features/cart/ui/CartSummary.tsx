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
    <section
      aria-label="Resumen del carrito"
      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-3 text-lg font-semibold text-neutral-900">Carrito</h2>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">El carrito está vacío.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {items.map((item) => {
            const product = productById.get(item.productId)
            return (
              <li key={item.productId} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-900">{product?.name ?? item.productId}</p>
                  <p className="text-sm text-neutral-500">Cantidad: {item.quantity}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Reducir cantidad de ${product?.name ?? item.productId}`}
                    onClick={() => dispatch({ type: 'itemDecremented', productId: item.productId })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar ${product?.name ?? item.productId} del carrito`}
                    onClick={() => dispatch({ type: 'itemRemoved', productId: item.productId })}
                    className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-3 flex items-baseline justify-between border-t border-neutral-100 pt-3">
        <p aria-live="polite" className="text-sm text-neutral-500">
          Subtotal provisional
        </p>
        <strong className="text-lg font-semibold text-neutral-900">{formatCents(subtotal)}</strong>
      </div>
      <p className="mt-1 text-xs text-neutral-400">El total definitivo se calcula al confirmar la compra.</p>
    </section>
  )
}
