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
    <main>
      <h1>Core E-Commerce Checkout</h1>
      <div>
        <section aria-label="Catálogo">
          <h2>Catálogo</h2>
          <ProductList state={productsState} onRetry={reload} />
        </section>

        <CartSummary products={products} />

        <CheckoutPanel items={items} canCheckout={canCheckout} onOrderConfirmed={reload} />
      </div>
    </main>
  )
}
