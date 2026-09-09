import { useProducts } from '../../features/catalog/model/useProducts'
import { ProductList } from '../../features/catalog/ui/ProductList'
import { selectCanCheckout, selectItems } from '../../features/cart/model/cartSelectors'
import { useCartState } from '../../features/cart/model/useCart'
import { CartSummary } from '../../features/cart/ui/CartSummary'
import { CheckoutPanel } from '../../features/checkout/ui/CheckoutPanel'
import { ShoppingBag } from '../../shared/ui/icons'

export function CheckoutPage() {
  const { state: productsState, reload } = useProducts()
  const cartState = useCartState()
  const products = productsState.status === 'success' ? productsState.data : []
  const items = selectItems(cartState)
  const canCheckout = selectCanCheckout(cartState)

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white shadow-[0_10px_25px_-12px_rgba(109,40,217,0.8)]">
            <ShoppingBag aria-hidden="true" size={19} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="text-xl font-black tracking-tight text-stone-950">Core E-Commerce Checkout</h1>
            <p className="text-sm text-stone-500">
              Descuentos acumulados por categoría, volumen y cupón, calculados por el backend.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="space-y-6 lg:col-span-2">
            <section aria-label="Catálogo">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Selección disponible</p>
              <h2 className="mb-3 mt-1 text-lg font-black tracking-tight text-stone-950">Catálogo</h2>
              <ProductList state={productsState} onRetry={reload} />
            </section>

            <CartSummary products={products} />
          </div>

          <div className="lg:sticky lg:top-8">
            <CheckoutPanel items={items} canCheckout={canCheckout} onOrderConfirmed={reload} />
          </div>
        </div>
      </main>
    </div>
  )
}
