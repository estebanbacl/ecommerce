import { CartProvider } from '../features/cart/model/CartProvider'
import { CheckoutPage } from '../pages/checkout/CheckoutPage'

export function App() {
  return (
    <CartProvider>
      <CheckoutPage />
    </CartProvider>
  )
}
