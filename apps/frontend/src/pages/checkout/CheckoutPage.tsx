import { useProducts } from '../../features/catalog/model/useProducts'
import { ProductList } from '../../features/catalog/ui/ProductList'
import { selectCanCheckout, selectItems } from '../../features/cart/model/cartSelectors'
import { useCartState } from '../../features/cart/model/useCart'
import { CartSummary } from '../../features/cart/ui/CartSummary'
import { CheckoutPanel } from '../../features/checkout/ui/CheckoutPanel'

export function CheckoutPage() {
  const { state: productsState, reload } = useProducts()
  const cartState = useCartState()
  const products = productsState.status === 'success' ? productsState.data : []
  const items = selectItems(cartState)
  const canCheckout = selectCanCheckout(cartState)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Core E-Commerce Checkout</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Descuentos acumulados por categoría, volumen y cupón, calculados por el backend.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          <section aria-label="Catálogo">
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">Catálogo</h2>
            <ProductList state={productsState} onRetry={reload} />
          </section>

          <CartSummary products={products} />
        </div>

        <div className="lg:sticky lg:top-8">
          <CheckoutPanel items={items} canCheckout={canCheckout} onOrderConfirmed={reload} />
        </div>
      </div>
    </main>
  )
}
