import type { ComponentType } from 'react'

import type { Category, Product } from '../../../types'
import { formatCents } from '../../../shared/lib/formatMoney'
import { BookOpen, Cpu, Package, Plus } from '../../../shared/ui/icons'
import { useCartDispatch, useCartState } from '../../cart/model/useCart'
import type { ProductsState } from '../model/useProducts'

const categoryLabel: Record<Category, string> = {
  TECHNOLOGY: 'Tecnología',
  HOME: 'Hogar',
  BOOKS: 'Libros',
}

const categoryTone: Record<Category, string> = {
  TECHNOLOGY: 'from-violet-100 via-violet-50 to-fuchsia-50 text-violet-700 ring-violet-100',
  HOME: 'from-amber-100 via-orange-50 to-white text-amber-700 ring-amber-100',
  BOOKS: 'from-emerald-100 via-teal-50 to-white text-emerald-700 ring-emerald-100',
}

const categoryIcon: Record<Category, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  TECHNOLOGY: Cpu,
  HOME: Package,
  BOOKS: BookOpen,
}

interface ProductListProps {
  state: ProductsState
  onRetry: () => void
}

export function ProductList({ state, onRetry }: ProductListProps) {
  if (state.status === 'loading') {
    return (
      <p role="status" className="rounded-2xl border border-stone-200 bg-white px-4 py-6 text-sm text-stone-500">
        Cargando catálogo…
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>No se pudo cargar el catálogo: {state.error.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-xl border border-red-300 bg-white px-3 py-1.5 text-sm font-bold text-red-700 hover:bg-red-100"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (state.data.length === 0) {
    return (
      <p className="rounded-2xl border border-stone-200 bg-white px-4 py-6 text-sm text-stone-500">
        El catálogo no tiene productos disponibles.
      </p>
    )
  }

  return (
    <ul aria-label="Catálogo de productos" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
  const Icon = categoryIcon[product.category]

  return (
    <li className="group flex flex-col rounded-2xl border border-stone-200/80 bg-white p-3 shadow-[0_18px_45px_-35px_rgba(28,25,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_55px_-32px_rgba(109,40,217,0.35)]">
      <div
        className={`relative grid aspect-[5/3] place-items-center overflow-hidden rounded-xl bg-gradient-to-br ring-1 ${categoryTone[product.category]}`}
      >
        <div className="relative grid size-16 place-items-center rounded-2xl bg-white/75 shadow-sm backdrop-blur-sm ring-1 ring-white">
          <Icon aria-hidden="true" size={30} strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-stone-500">
            {categoryLabel[product.category]}
          </span>
          <span className={`text-xs font-semibold ${product.stock - inCart <= 2 ? 'text-amber-700' : 'text-stone-500'}`}>
            Stock: {product.stock - inCart}
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold tracking-tight text-stone-950">{product.name}</h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="text-xl font-black tracking-tight text-stone-950">{formatCents(product.unitPrice)}</p>

          <button
            type="button"
            aria-label={`Agregar ${product.name} al carrito`}
            disabled={isSoldOut}
            onClick={() => dispatch({ type: 'itemAdded', productId: product.id, knownStock: product.stock })}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-stone-950 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          >
            <Plus aria-hidden="true" size={15} />
            Agregar
          </button>
        </div>
        {isSoldOut && (
          <span role="status" className="mt-2 text-xs font-semibold text-red-600">
            Sin stock disponible
          </span>
        )}
      </div>
    </li>
  )
}
