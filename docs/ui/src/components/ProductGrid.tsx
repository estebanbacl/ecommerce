import {
  Backpack,
  Headphones,
  Keyboard,
  LampDesk,
  Minus,
  Plus,
} from 'lucide-react'
import { formatUsd } from '../lib/money'
import type { Product, ProductTone } from '../types'

export interface ProductGridProps {
  readonly products: readonly Product[]
  readonly quantities: Readonly<Record<string, number>>
  readonly onAddToCart: (productId: string) => void
  readonly onRemoveFromCart: (productId: string) => void
}

interface ProductCardProps {
  readonly product: Product
  readonly quantity: number
  readonly onAdd: () => void
  readonly onRemove: () => void
}

const toneClasses: Record<ProductTone, string> = {
  violet:
    'from-violet-100 via-violet-50 to-fuchsia-50 text-violet-700 ring-violet-100',
  sky: 'from-sky-100 via-cyan-50 to-white text-sky-700 ring-sky-100',
  amber: 'from-amber-100 via-orange-50 to-white text-amber-700 ring-amber-100',
  emerald:
    'from-emerald-100 via-teal-50 to-white text-emerald-700 ring-emerald-100',
}

function ProductArtwork({ product }: { readonly product: Product }) {
  const iconProps = { size: 52, strokeWidth: 1.35 } as const
  let icon = <LampDesk aria-hidden="true" {...iconProps} />

  if (product.id === 'tech-001') {
    icon = <Headphones aria-hidden="true" {...iconProps} />
  } else if (product.id === 'tech-002') {
    icon = <Keyboard aria-hidden="true" {...iconProps} />
  } else if (product.id === 'accessory-001') {
    icon = <Backpack aria-hidden="true" {...iconProps} />
  }

  return (
    <div
      className={`relative grid aspect-[5/3] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ring-1 ${toneClasses[product.tone]}`}
    >
      <div className="absolute left-5 top-5 size-14 rounded-full bg-white/60 blur-xl" />
      <div className="absolute -bottom-8 -right-4 size-24 rounded-full bg-current opacity-[0.07]" />
      <div className="relative grid size-24 place-items-center rounded-[1.75rem] bg-white/75 shadow-[0_24px_45px_-30px_currentColor] backdrop-blur-sm ring-1 ring-white">
        {icon}
      </div>
    </div>
  )
}

function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  const remainingStock = product.stock - quantity
  const isOutOfStock = remainingStock <= 0

  return (
    <article className="group flex h-full flex-col rounded-[1.4rem] border border-stone-200/80 bg-white p-3 shadow-[0_18px_45px_-35px_rgba(28,25,23,0.45)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_55px_-32px_rgba(109,40,217,0.35)]">
      <ProductArtwork product={product} />

      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-stone-500">
            {product.category}
          </span>
          <span
            className={`text-xs font-semibold ${
              remainingStock <= 2 ? 'text-amber-700' : 'text-stone-500'
            }`}
          >
            {remainingStock} disponibles
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold tracking-tight text-stone-950">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-stone-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
              Precio
            </p>
            <p className="mt-0.5 text-xl font-black tracking-tight text-stone-950">
              {formatUsd(product.unitPrice)}
            </p>
          </div>

          {quantity === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              disabled={isOutOfStock}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-stone-950 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <Plus aria-hidden="true" size={16} />
              Agregar
            </button>
          ) : (
            <div
              className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1"
              aria-label={`Cantidad de ${product.name}`}
            >
              <button
                type="button"
                onClick={onRemove}
                className="grid size-8 place-items-center rounded-lg text-stone-600 transition hover:bg-white hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                aria-label={`Remover una unidad de ${product.name}`}
              >
                <Minus aria-hidden="true" size={15} />
              </button>
              <span className="w-7 text-center text-sm font-bold text-stone-950 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={onAdd}
                disabled={isOutOfStock}
                className="grid size-8 place-items-center rounded-lg bg-white text-stone-950 shadow-sm transition hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-stone-300 disabled:shadow-none"
                aria-label={`Agregar una unidad de ${product.name}`}
              >
                <Plus aria-hidden="true" size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({
  products,
  quantities,
  onAddToCart,
  onRemoveFromCart,
}: ProductGridProps) {
  return (
    <section aria-labelledby="catalog-title">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
            Selección curada
          </p>
          <h2
            id="catalog-title"
            className="mt-2 text-2xl font-black tracking-[-0.03em] text-stone-950 sm:text-3xl"
          >
            Productos para tu día a día
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-5 text-stone-500 sm:text-right">
          Combina productos y descubre tus descuentos al finalizar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] ?? 0}
            onAdd={() => onAddToCart(product.id)}
            onRemove={() => onRemoveFromCart(product.id)}
          />
        ))}
      </div>
    </section>
  )
}
