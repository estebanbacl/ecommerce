import type { FormEvent } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
  TicketPercent,
} from 'lucide-react'
import { formatUsd } from '../lib/money'
import type { CartItem, DiscountBreakdown } from '../types'
import { DiscountLimitBanner } from './DiscountLimitBanner'
import { TotalsBreakdown } from './TotalsBreakdown'

export interface CartCheckoutPanelProps {
  readonly items: readonly CartItem[]
  readonly originalSubtotal: number
  readonly couponCode: string
  readonly couponApplied: boolean
  readonly breakdown: DiscountBreakdown
  readonly previewLimitAlert: boolean
  readonly orderConfirmed: boolean
  readonly onCouponCodeChange: (value: string) => void
  readonly onApplyCoupon: () => void
  readonly onAddToCart: (productId: string) => void
  readonly onRemoveFromCart: (productId: string) => void
  readonly onCheckout: () => void
}

interface CartLineProps {
  readonly item: CartItem
  readonly onAdd: () => void
  readonly onRemove: () => void
}

function CartLine({ item, onAdd, onRemove }: CartLineProps) {
  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-stone-100 text-sm font-black text-stone-600">
        {item.product.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-stone-900">
          {item.product.name}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          {formatUsd(item.product.unitPrice)} c/u
        </p>
      </div>
      <div className="flex items-center rounded-lg border border-stone-200 bg-white p-0.5">
        <button
          type="button"
          onClick={onRemove}
          className="grid size-7 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          aria-label={`Remover una unidad de ${item.product.name}`}
        >
          <Minus aria-hidden="true" size={13} />
        </button>
        <span className="w-6 text-center text-xs font-bold tabular-nums">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onAdd}
          disabled={item.quantity >= item.product.stock}
          className="grid size-7 place-items-center rounded-md text-stone-700 transition hover:bg-stone-100 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:text-stone-300"
          aria-label={`Agregar una unidad de ${item.product.name}`}
        >
          <Plus aria-hidden="true" size={13} />
        </button>
      </div>
    </li>
  )
}

export function CartCheckoutPanel({
  items,
  originalSubtotal,
  couponCode,
  couponApplied,
  breakdown,
  previewLimitAlert,
  orderConfirmed,
  onCouponCodeChange,
  onApplyCoupon,
  onAddToCart,
  onRemoveFromCart,
  onCheckout,
}: CartCheckoutPanelProps) {
  const handleCouponSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onApplyCoupon()
  }

  return (
    <aside
      className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_28px_80px_-40px_rgba(28,25,23,0.45)]"
      aria-labelledby="cart-title"
    >
      <div className="border-b border-stone-100 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-stone-950 text-white">
              <ShoppingBag aria-hidden="true" size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold text-stone-400">Tu selección</p>
              <h2 id="cart-title" className="text-lg font-black text-stone-950">
                Carrito
              </h2>
            </div>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600">
            {items.reduce((total, item) => total + item.quantity, 0)}{' '}
            {items.length === 1 && items[0]?.quantity === 1 ? 'producto' : 'productos'}
          </span>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5 sm:px-6">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-8 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-white text-stone-400 shadow-sm">
              <ShoppingBag aria-hidden="true" size={19} />
            </span>
            <p className="mt-3 text-sm font-bold text-stone-800">
              Tu carrito está esperando
            </p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              Agrega un producto para comenzar.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100" aria-label="Productos seleccionados">
            {items.map((item) => (
              <CartLine
                key={item.product.id}
                item={item}
                onAdd={() => onAddToCart(item.product.id)}
                onRemove={() => onRemoveFromCart(item.product.id)}
              />
            ))}
          </ul>
        )}

        <div
          className="flex items-center justify-between rounded-xl bg-stone-950 px-4 py-3 text-white"
          aria-live="polite"
        >
          <span className="text-sm text-stone-300">Subtotal original</span>
          <strong className="text-lg tabular-nums">{formatUsd(originalSubtotal)}</strong>
        </div>

        <form onSubmit={handleCouponSubmit} className="space-y-2.5">
          <label
            htmlFor="coupon-code"
            className="flex items-center gap-2 text-sm font-bold text-stone-800"
          >
            <TicketPercent aria-hidden="true" size={16} className="text-violet-600" />
            ¿Tienes un cupón?
          </label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <input
                id="coupon-code"
                name="couponCode"
                type="text"
                value={couponCode}
                onChange={(event) => onCouponCodeChange(event.target.value)}
                placeholder="WELCOME2026"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 pr-9 text-sm font-semibold uppercase tracking-wide text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
              {couponApplied ? (
                <Check
                  aria-label="Cupón aplicado"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600"
                  size={17}
                />
              ) : null}
            </div>
            <button
              type="submit"
              disabled={items.length === 0 || couponCode.trim().length === 0}
              className="h-11 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
            >
              Aplicar
            </button>
          </div>
          <p className="text-xs text-stone-400">
            Prueba el código <span className="font-semibold text-stone-600">WELCOME2026</span>
          </p>
        </form>

        <div className="h-px bg-stone-100" />

        <TotalsBreakdown breakdown={breakdown} />

        <DiscountLimitBanner
          visible={breakdown.limitApplied || previewLimitAlert}
        />

        {orderConfirmed ? (
          <div
            className="flex items-start gap-3 rounded-2xl bg-violet-50 p-4 text-violet-950"
            role="status"
          >
            <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold">Pedido confirmado</p>
              <p className="mt-1 text-xs leading-5 text-violet-700">
                Orden #NM-2026-0918 · Recibirás el detalle en unos instantes.
              </p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onCheckout}
          disabled={items.length === 0 || orderConfirmed}
          className="group flex min-h-12 w-full items-center justify-between rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_35px_-18px_rgba(109,40,217,0.8)] transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
        >
          <span className="flex items-center gap-2">
            <LockKeyhole aria-hidden="true" size={16} />
            {orderConfirmed ? 'Compra completada' : 'Confirmar compra'}
          </span>
          <ArrowRight
            aria-hidden="true"
            size={17}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>

        <p className="text-center text-[0.68rem] leading-4 text-stone-400">
          Pago seguro · Precios expresados en USD · Vista con datos simulados
        </p>
      </div>
    </aside>
  )
}
