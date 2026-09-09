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
    return <p role="status">Cargando catálogo…</p>
  }

  if (state.status === 'error') {
    return (
      <div role="alert">
        <p>No se pudo cargar el catálogo: {state.error.message}</p>
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  }

  if (state.data.length === 0) {
    return <p>El catálogo no tiene productos disponibles.</p>
  }

  return (
    <ul aria-label="Catálogo de productos">
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
    <li>
      <span>{product.name}</span>
      <span> · {categoryLabel[product.category]}</span>
      <span> · {formatCents(product.unitPrice)}</span>
      <span> · Stock: {product.stock - inCart}</span>
      <button
        type="button"
        aria-label={`Agregar ${product.name} al carrito`}
        disabled={isSoldOut}
        onClick={() => dispatch({ type: 'itemAdded', productId: product.id, knownStock: product.stock })}
      >
        Agregar
      </button>
      {isSoldOut && <span role="status"> Sin stock disponible</span>}
    </li>
  )
}
