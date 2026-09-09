import type { Category, Product } from '../../../types'
import { formatCents } from '../../../shared/lib/formatMoney'
import { useCartDispatch, useCartState } from '../../cart/model/useCart'
import type { ProductsState } from '../model/useProducts'

const categoryLabel: Record<Category, string> = {
  TECHNOLOGY: 'Tecnología',
  HOME: 'Hogar',
  BOOKS: 'Libros',
}

interface ProductListProps {
  state: ProductsState
  onRetry: () => void
}

export function ProductList({ state, onRetry }: ProductListProps) {
  if (state.status === 'loading') {
    return (
      <p role="status" className="rounded-xl border border-neutral-200 bg-white px-4 py-6 text-sm text-neutral-500">
        Cargando catálogo…
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>No se pudo cargar el catálogo: {state.error.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (state.data.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-white px-4 py-6 text-sm text-neutral-500">
        El catálogo no tiene productos disponibles.
      </p>
    )
  }

  return (
    <ul aria-label="Catálogo de productos" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {state.data.map((product) => (
        <ProductRow key={product.id} product={product} />
      ))}
    </ul>
  )
}

function ProductRow({ product }: { product: Product }) {
  const cart = useCartState()
  const dispatch = useCartDispatch()

  const inCart = cart.itemsByProductId[product.id]?.quantity ?? 0
  const isSoldOut = inCart >= product.stock

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-neutral-900">{product.name}</span>
        <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          {categoryLabel[product.category]}
        </span>
      </div>
      <div className="flex items-baseline justify-between text-sm text-neutral-500">
        <span className="text-base font-semibold text-neutral-900">{formatCents(product.unitPrice)}</span>
        <span>Stock: {product.stock - inCart}</span>
      </div>
      <button
        type="button"
        aria-label={`Agregar ${product.name} al carrito`}
        disabled={isSoldOut}
        onClick={() => dispatch({ type: 'itemAdded', productId: product.id, knownStock: product.stock })}
        className="mt-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
      >
        Agregar
      </button>
      {isSoldOut && (
        <span role="status" className="text-xs font-medium text-red-600">
          Sin stock disponible
        </span>
      )}
    </li>
  )
}
