import { CartProvider } from '../features/cart/model/CartProvider'
import { CheckoutPage } from '../pages/checkout/CheckoutPage'

export function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-neutral-50">
        <CheckoutPage />
      </div>
    </CartProvider>
  )
}
