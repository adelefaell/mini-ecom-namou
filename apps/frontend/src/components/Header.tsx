import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"

export default function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate("/")
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-semibold tracking-tight">
          Mini E-Com
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" render={<Link to="/wishlist" />}>
              <Heart className="size-4" />
              Wishlist{wishlist.items.length > 0 ? ` (${wishlist.items.length})` : ""}
            </Button>
            <Button variant="ghost" size="sm" render={<Link to="/cart" />}>
              <ShoppingCart className="size-4" />
              Cart{count > 0 ? ` (${count})` : ""}
            </Button>
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" render={<Link to="/login" />}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  )
}