import { useState } from 'react'
import {
  BadgeCheck,
  Eye,
  Leaf,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { CartCheckoutPanel } from './components/CartCheckoutPanel'
import { ProductGrid } from './components/ProductGrid'
import { mockProducts } from './data/mock-products'
import { calculateMockBreakdown } from './lib/mock-pricing'
import type { CartItem } from './types'

const initialQuantities: Readonly<Record<string, number>> = {
  'tech-001': 1,
  'accessory-001': 1,
}

function getCartItems(
  quantities: Readonly<Record<string, number>>,
): readonly CartItem[] {
  return mockProducts.flatMap((product) => {
    const quantity = quantities[product.id] ?? 0
    return quantity > 0 ? [{ product, quantity }] : []
  })
}

export function App() {
  const [quantities, setQuantities] =
    useState<Readonly<Record<string, number>>>(initialQuantities)
  const [couponCode, setCouponCode] = useState('WELCOME2026')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [previewLimitAlert, setPreviewLimitAlert] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState(false)

  const cartItems = getCartItems(quantities)
  const breakdown = calculateMockBreakdown(cartItems, appliedCoupon)

  const handleAddToCart = (productId: string) => {
    const product = mockProducts.find((candidate) => candidate.id === productId)
    if (!product) return

    setQuantities((current) => {
      const currentQuantity = current[productId] ?? 0
      if (currentQuantity >= product.stock) return current

      return { ...current, [productId]: currentQuantity + 1 }
    })
    setOrderConfirmed(false)
  }

  const handleRemoveFromCart = (productId: string) => {
    setQuantities((current) => {
      const currentQuantity = current[productId] ?? 0
      if (currentQuantity === 0) return current

      if (currentQuantity === 1) {
        const { [productId]: _removedItem, ...remaining } = current
        return remaining
      }

      return { ...current, [productId]: currentQuantity - 1 }
    })
    setOrderConfirmed(false)
  }

  const handleCouponCodeChange = (value: string) => {
    setCouponCode(value)
    setAppliedCoupon('')
    setOrderConfirmed(false)
  }

  const handleApplyCoupon = () => {
    setAppliedCoupon(couponCode.trim().toUpperCase())
    setOrderConfirmed(false)
  }

  const handleResetPreview = () => {
    setQuantities(initialQuantities)
    setCouponCode('WELCOME2026')
    setAppliedCoupon('')
    setPreviewLimitAlert(false)
    setOrderConfirmed(false)
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-stone-950">
      <div className="border-b border-stone-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <p className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Eye aria-hidden="true" size={15} className="text-violet-600" />
            Vista de diseño · Datos simulados
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={previewLimitAlert}
              onClick={() => setPreviewLimitAlert((current) => !current)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                previewLimitAlert
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {previewLimitAlert ? 'Alerta visible' : 'Previsualizar alerta 35%'}
            </button>
            <button
              type="button"
              onClick={handleResetPreview}
              className="grid size-8 place-items-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Restablecer vista previa"
            >
              <RotateCcw aria-hidden="true" size={14} />
            </button>
          </div>
        </div>
      </div>

      <header className="border-b border-stone-200/70 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
          <a
            href="#catalog"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-4"
          >
            <span className="grid size-10 place-items-center rounded-[0.9rem] bg-violet-600 text-white shadow-[0_10px_25px_-12px_rgba(109,40,217,0.8)]">
              <ShoppingBag aria-hidden="true" size={19} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-sm font-black tracking-[0.18em] text-stone-950">
                NOVA
              </span>
              <span className="block text-[0.6rem] font-bold uppercase tracking-[0.28em] text-stone-400">
                market
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-3 text-xs font-semibold text-stone-400 md:flex">
            <span className="text-violet-700">01 Carrito</span>
            <span className="h-px w-8 bg-violet-200" />
            <span>02 Descuentos</span>
            <span className="h-px w-8 bg-stone-200" />
            <span>03 Confirmación</span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <ShieldCheck aria-hidden="true" size={15} />
            <span className="hidden sm:inline">Compra protegida</span>
            <span className="sm:hidden">Seguro</span>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-stone-200/70 bg-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(124,58,237,0.10),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(16,185,129,0.08),transparent_25%)]" />
          <div className="relative mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                <Sparkles aria-hidden="true" size={14} />
                Descuentos que se acumulan contigo
              </div>
              <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-stone-950 sm:text-5xl lg:text-6xl">
                Lo que te gusta,
                <span className="block text-violet-600">ahora suma más.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-stone-500 sm:text-lg">
                Combina productos, aplica tu cupón y mira cada ahorro con total
                transparencia antes de confirmar.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-stone-200 bg-white p-3 text-center shadow-sm sm:p-4">
                <BadgeCheck aria-hidden="true" className="mx-auto text-violet-600" size={19} />
                <p className="mt-2 text-xs font-bold text-stone-700">Garantía</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-3 text-center shadow-sm sm:p-4">
                <Leaf aria-hidden="true" className="mx-auto text-emerald-600" size={19} />
                <p className="mt-2 text-xs font-bold text-stone-700">Envío eco</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-3 text-center shadow-sm sm:p-4">
                <ShieldCheck aria-hidden="true" className="mx-auto text-sky-600" size={19} />
                <p className="mt-2 text-xs font-bold text-stone-700">Pago seguro</p>
              </div>
            </div>
          </div>
        </section>

        <div
          id="catalog"
          className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:px-10"
        >
          <ProductGrid
            products={mockProducts}
            quantities={quantities}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
          />

          <div className="lg:sticky lg:top-6">
            <CartCheckoutPanel
              items={cartItems}
              originalSubtotal={breakdown.originalSubtotal}
              couponCode={couponCode}
              couponApplied={appliedCoupon === 'WELCOME2026'}
              breakdown={breakdown}
              previewLimitAlert={previewLimitAlert}
              orderConfirmed={orderConfirmed}
              onCouponCodeChange={handleCouponCodeChange}
              onApplyCoupon={handleApplyCoupon}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onCheckout={() => setOrderConfirmed(true)}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>© 2026 Nova Market · UI concept</p>
          <p>Componentes controlados · Sin conexión directa a APIs</p>
        </div>
      </footer>
    </div>
  )
}
