# 03 — Auth end-to-end (JWT)

**What to build:** A login screen backed by a JWT flow. A seeded demo user signs in; the backend validates credentials against the bcrypt-hashed password and issues a JWT in an httpOnly SameSite=Lax cookie. The frontend stores the session, shows the user in the header, and provides a logout. Routes that require ownership — cart, wishlist, checkout, and the "Add to Cart"/"Add to Wishlist" actions — are gated: unauthenticated visitors are redirected to the login screen. The catalogue stays public.

**Scope notes:** login only (no registration) with a single seeded demo user; no refresh tokens or account pages.

**Blocked by:** 02 — Product catalogue end-to-end.

**Status:** ready-for-agent

- [ ] Login screen authenticates the seeded demo user and fails cleanly on bad credentials
- [ ] JWT issued in an httpOnly SameSite=Lax cookie; `GET /api/auth/me` returns the current user; logout clears the session
- [ ] Cart/wishlist/checkout routes and both "Add" actions reject unauthenticated requests; frontend redirects to login
- [ ] Header shows the signed-in user with a logout action; catalogue remains reachable without login
- [ ] Backend integration tests (login, me, protected route rejection) + frontend login page test; suite green