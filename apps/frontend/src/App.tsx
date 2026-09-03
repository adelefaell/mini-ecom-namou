import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProductList from "@/pages/ProductList"
import ProductDetail from "@/pages/ProductDetail"
import Login from "@/pages/Login"
import Cart from "@/pages/Cart"
import Wishlist from "@/pages/Wishlist"
import Checkout from "@/pages/Checkout"
import Header from "@/components/Header"
import { AuthProvider } from "@/hooks/use-auth"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}