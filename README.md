# Pillar 2 — Functional Engineering Test

This is my submission for the Logic pillar of the React Frontend Engineer assessment — a product dashboard with Google login, cart management, and checkout logic, built on Next.js 14.

I went a bit past the base requirements where it made sense (search, filtering, pagination, an admin view), and I've tried to document why below rather than just listing what exists.

## Live Links

GitHub: `https://replace-with-your-public-github-repository-url`
Demo: `https://replace-with-your-vercel-demo-url`

## Stack

Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Auth.js v5 with Google OAuth, Zustand (with persist middleware), Sonner for toasts, and Vitest/Testing Library for tests.

## How the requirements were met

### Auth & Security

Login is handled with Auth.js's Google provider (`lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`). The `/login` page has a working "Sign in with Google" button that redirects back to wherever the user was trying to go once they're authenticated.

Route protection happens at the edge, in `middleware.ts` and `lib/routeProtection.ts` — not just a client-side check, since that was explicitly called out as the senior-level expectation. Anyone hitting `/dashboard` or a sub-route without a session gets bounced to `/login?callbackUrl=...`. The dashboard layout also re-checks the session server-side as a second layer.

Sessions are JWT-based, so a refresh doesn't log you out. The navbar (`components/Navbar.tsx`) shows the user's avatar (or an initial if there's no photo), their name, the cart count, and a logout button wired to `signOut()`.

### Inventory & Cart

Products come from `/api/products` and are rendered through `ProductGrid.tsx`, which handles the loading/success/empty/error states.

Stock logic is centralized in one function, `getStockStatus()` in `types/product.ts`, and consumed by `ProductCard.tsx`:

- `stock = 0` → red indicator, "Out of Stock" label, button disabled (with `aria-disabled` for screen readers)
- `0 < stock < 5` → amber indicator, "Low Stock" badge, remaining-count text, button still works
- `stock >= 5` → normal green indicator, nothing extra shown

Cart state lives in a Zustand store (`store/cartStore.ts`) so it's reachable from the navbar, product cards, the checkout bar, and the cart page without prop drilling. Adding an item updates the cart count immediately — the store mutation is synchronous, so there's no waiting on a network call before the UI reflects it.

Checkout (`app/dashboard/cart/page.tsx` → `/api/checkout`) checks for a session first and redirects to login if there isn't one, shows a loading state on the button, simulates a 1.5s request, and either clears the cart with a success toast or leaves it intact with a retryable error toast.

### Polish

Skeletons instead of spinners while products load (`SkeletonLoader.tsx`), a proper error state with a retry button that re-fires the fetch (`ErrorState.tsx`), and a real empty state for both an empty catalog and an empty cart (`EmptyState.tsx`). Toasts are handled globally through Sonner, mounted once in `Providers.tsx`.

### Mock API & Data

`/api/products` is the internal mock endpoint, and it does more than just return a static array — it supports search, category filtering, pagination, and two test-only states (`state=empty`, `state=error`) so the empty/error UI can be demoed without needing to fake a network failure. The original 3-product sample from the brief got expanded into a 50-product catalog (`lib/productCatalog.ts`) using real product images, mostly so the search/filter/pagination work had something realistic to operate on.

## Bonus challenges

I ended up doing all four, not just the two asked for:

1. **Edge middleware** — covered above, `middleware.ts`.
2. **RBAC** — the session carries a `role` of `admin` or `manager` (`lib/auth.ts`, `types/next-auth.d.ts`). Admin-only UI is hidden from managers, and `/dashboard/admin/inventory` calls `notFound()` server-side if a manager tries to hit it directly.
3. **Code splitting** — `CheckoutBar` is loaded via `next/dynamic` on the dashboard page, since it's not needed for the initial render.
4. **Cart persistence** — Zustand's `persist` middleware keeps the cart in `localStorage`, scoped per user email so two people signed in on the same browser don't see each other's cart.

I didn't include a Lighthouse screenshot for the code-splitting bonus — the split is there in the code, but I don't have a before/after capture to show for it.

## Beyond the brief

A few things I added that weren't asked for, because they felt like natural extensions of what was already there:

- **Search** — by product name, both client-side in `ProductGrid.tsx` and server-side via `/api/products?search=...`.
- **Category filtering** — same pattern, `?category=...`.
- **Pagination** — numbered pages with prev/next, once the catalog grew to 50 products a single scrolling grid stopped making sense.
- **Admin inventory dashboard** at `/dashboard/admin/inventory` — a natural place to actually use the RBAC role instead of just having it sit unused in the session.
- **Inventory metrics** on the main dashboard for admin users.
- **A dedicated cart page** (`/dashboard/cart`) instead of a dropdown/drawer, mostly so checkout state had somewhere proper to live.
- **Per-user cart persistence** — the localStorage key is scoped by email so switching accounts doesn't leak one person's cart into another's.
- A handful of **tests** covering the product API, route protection, cart behavior, and the stock-status helper.

## On IAM / RBAC specifically

Since this came up as a bonus item, worth being direct about how it actually works: this is a demo role model, not a real permissions system. Auth.js handles identity through Google OAuth and JWT sessions; the JWT callback in `lib/auth.ts` attaches a `role` field, and the session callback exposes it on `session.user.role`. Middleware protects the routes; `/dashboard/admin/inventory` does an additional server-side check and returns `notFound()` for anyone without the admin role.

The actual rule right now is hardcoded: `m.hasan142121@gmail.com` gets `admin`, everyone else gets `manager`. That's obviously not how you'd do this in production — a real version would pull roles from a database or an identity provider rather than a string comparison — but for the scope of this test it demonstrates the mechanism without needing a database.

## Product API reference

```
GET /api/products
```

Query params: `page`, `perPage`, `category`, `search`, `state=empty`, `state=error`

Response:

```ts
{
  products: Product[];
  total: number;
  categories: ProductCategory[];
  page: number;
  perPage: number;
  totalPages: number;
  error?: string;
}
```

## Checkout flow

1. User clicks Checkout.
2. Client checks for a session; no session → redirect to `/login?callbackUrl=/dashboard/cart`.
3. Button enters a loading state.
4. `/api/checkout` re-verifies the session server-side.
5. 1.5s simulated delay.
6. Success → toast + cart cleared. Failure → toast with a Retry option, cart untouched.

## Running it locally

```bash
npm install
cp .env.example .env.local
```

Generate a secret:

```bash
openssl rand -base64 32
```

Fill in `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
AUTH_SECRET=same_secret_again_for_authjs_v5
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Then:

```bash
npm run dev
```

or `npm run build` for a production build.

### Google OAuth

Local callback: `http://localhost:3000/api/auth/callback/google`
Production callback: `https://your-vercel-domain.vercel.app/api/auth/callback/google`

Only `.env.example` (placeholders) is committed — real secrets stay out of the repo and get set directly in Vercel's environment variable settings.

## A few tech decisions, explained

**Zustand over Redux** — the cart doesn't need much: add, remove, update quantity, totals, checkout status, persistence. Zustand covers that with a fraction of the boilerplate Redux would need, and the built-in `persist` middleware meant I didn't have to hand-roll localStorage syncing.

**JWT sessions over database sessions** — satisfies the "survives a refresh" requirement without standing up a database for what's ultimately a take-home test, and it made attaching the role for RBAC straightforward through the JWT callback.

**Route Handlers instead of a separate mock server** — the brief asks for an internal mock API, and Next.js Route Handlers let that live inside the app while still giving the frontend a real fetch boundary to handle loading/error/empty states against — closer to how it'd actually work against a real backend.

## Design notes

I leaned dashboard-functional over polished marketing-page styling, since that's what the brief was testing. Product cards lead with image, name, price, and stock state. Search stays visible at all times; category filtering sits behind a filter toggle so the header doesn't get crowded. The admin inventory view uses tables and metric cards since that's a scanning-heavy screen, not a browsing one.

I didn't have Figma specs for this particular checkout, so the visual direction follows the written requirements and stays consistent with the rest of the dashboard rather than matching a design file pixel-for-pixel.

## Known limitations

- RBAC role assignment is a hardcoded email check, not a real permissions system — noted above, would need a database or IdP in production.
- No Lighthouse screenshot for the code-splitting bonus.
- Mock checkout always succeeds unless explicitly forced to fail for testing — there's no real payment processing.

## Routes

- `/` — redirects to `/dashboard` or `/login` based on session state
- `/login` — public login page
- `/dashboard` — protected product dashboard
- `/dashboard/cart` — protected cart and checkout
- `/dashboard/admin/inventory` — admin-only
- `/api/auth/[...nextauth]` — Auth.js handler
- `/api/products` — mock product API
- `/api/checkout` — mock checkout with session verification
