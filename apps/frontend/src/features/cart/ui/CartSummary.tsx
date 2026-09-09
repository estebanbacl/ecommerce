import type { Product } from '../../../types'
import { formatCents } from '../../../shared/lib/formatMoney'
import { Minus, Plus, ShoppingBag } from '../../../shared/ui/icons'
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
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-stone-950 text-white">
          <ShoppingBag aria-hidden="true" size={15} />
        </span>
        <h2 className="text-lg font-black tracking-tight text-stone-950">Carrito</h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-stone-500">El carrito está vacío.</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {items.map((item) => {
            const product = productById.get(item.productId)
            return (
              <li key={item.productId} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-bold text-stone-900">{product?.name ?? item.productId}</p>
                  <p className="text-sm text-stone-500">Cantidad: {item.quantity}</p>
                </div>
                <div className="flex shrink-0 items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
                  <button
                    type="button"
                    aria-label={`Reducir cantidad de ${product?.name ?? item.productId}`}
                    onClick={() => dispatch({ type: 'itemDecremented', productId: item.productId })}
                    className="grid size-8 place-items-center rounded-lg text-stone-600 transition hover:bg-white hover:text-stone-950"
                  >
                    <Minus aria-hidden="true" size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Agregar una unidad de ${product?.name ?? item.productId}`}
                    onClick={() =>
                      dispatch({
                        type: 'itemAdded',
                        productId: item.productId,
                        knownStock: product?.stock ?? item.quantity,
                      })
                    }
                    disabled={product !== undefined && item.quantity >= product.stock}
                    className="grid size-8 place-items-center rounded-lg bg-white text-stone-950 shadow-sm transition hover:text-violet-700 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-stone-300 disabled:shadow-none"
                  >
                    <Plus aria-hidden="true" size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar ${product?.name ?? item.productId} del carrito`}
                    onClick={() => dispatch({ type: 'itemRemoved', productId: item.productId })}
                    className="ml-1 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-500 transition hover:bg-white hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div
        className="mt-3 flex items-center justify-between rounded-xl bg-stone-950 px-4 py-3 text-white"
        aria-live="polite"
      >
        <span className="text-sm text-stone-300">Subtotal provisional</span>
        <strong className="text-lg tabular-nums">{formatCents(subtotal)}</strong>
      </div>
      <p className="mt-1.5 text-xs text-stone-400">El total definitivo se calcula al confirmar la compra.</p>
    </section>
  )
}
