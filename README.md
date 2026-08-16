# Pillar 2 - Functional Engineering Test

Secure product dashboard built with Next.js 14 App Router, strict TypeScript,
Tailwind CSS, Auth.js/NextAuth.js v5 Google OAuth, Zustand, persisted cart
state, Sonner notifications, and internal Route Handlers for mock APIs.

## Technology Stack

- Next.js 14 App Router and React 18
- Strict TypeScript with `.ts` and `.tsx` source files only
- Tailwind CSS
- Auth.js / NextAuth.js v5 with Google OAuth and JWT sessions
- Zustand with `persist` middleware for cart persistence
- Sonner for toast notifications
- Vitest, Testing Library, and jsdom

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

Required variables:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_a_secure_random_secret
AUTH_SECRET=replace_with_the_same_secure_random_secret_for_authjs_v5
GOOGLE_CLIENT_ID=replace_with_google_client_id
GOOGLE_CLIENT_SECRET=replace_with_google_client_secret
```

`lib/auth.ts` reads `AUTH_SECRET` first and falls back to `NEXTAUTH_SECRET`,
so the assessment variable and Auth.js v5 naming both work.

Run locally:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

## Google OAuth

Create a Google OAuth web client in Google Cloud Console.

Local callback URL:

```text
http://localhost:3000/api/auth/callback/google
```

Vercel callback URL:

```text
https://your-vercel-domain.vercel.app/api/auth/callback/google
```

Do not commit `.env.local`; it is ignored by `.gitignore`.

## Routes

- `/` redirects to `/dashboard` or `/login` based on session.
- `/login` is public and redirects authenticated users through middleware.
- `/dashboard` is protected and renders the product dashboard.
- `/dashboard/cart` is protected and renders cart/checkout.
- `/api/auth/[...nextauth]` handles Auth.js routes.
- `/api/products` returns the typed mock product response.
- `/api/checkout` verifies session and simulates checkout processing.

Unknown routes under `/dashboard` show `app/dashboard/not-found.tsx`.

## Architecture

Authentication is configured in `lib/auth.ts` using Google OAuth and JWT
sessions. `middleware.ts` wraps Auth.js middleware and delegates redirect
decisions to `lib/routeProtection.ts`, preserving the requested dashboard URL
in `callbackUrl`. `app/dashboard/layout.tsx` also checks the session on the
server as a second layer.

The cart is managed in `store/cartStore.ts`. Zustand was selected instead of
Redux or Context API because the shared state is focused, action-heavy cart
state. Zustand gives small selectors, simple actions, and first-party
localStorage persistence without Redux boilerplate or Context-wide rerenders.

## Product API

`app/api/products/route.ts` returns:

- `products: Product[]`
- `total: number`
- optional user-safe `error`

Normal UI fetches `/api/products`. Testable states are available without
randomness:

- `/api/products?state=empty`
- `/api/products?state=error`

## Inventory Rules

Implemented through `getStockStatus` in `types/product.ts`.

- `stock === 0`: shows "Out of Stock", disables add, sets `aria-disabled`.
- `0 < stock < 5`: shows "Low Stock", remaining count, add enabled.
- `stock >= 5`: normal state, add enabled, no low-stock badge.

Cart quantity can never exceed stock, cannot go negative, and removes the item
when decreased below one.

## Checkout Behavior

Checkout verifies the current server session through `POST /api/checkout`.
Authenticated checkout enters a loading state, blocks repeated clicks, waits
about 1500ms in the route handler, clears the cart on success, and preserves
the cart on failure. Failure is deterministic for tests through the
`x-force-fail: true` request header.

## UI States

The dashboard implements skeleton loading, success cards, friendly error state
with Retry, and meaningful empty state. Toasts are added once in
`components/Providers.tsx` and cover product add, remove, clear, checkout
success, checkout failure, and product-fetch failure.

## Completed Bonus Features

- Edge middleware route protection for `/dashboard` and `/dashboard/:path*`.
- Zustand cart persistence with hydration-safe client rehydration.
- RBAC demo role on Auth.js JWT/session: `admin` or `manager`.
- Dynamic import/code splitting for the noncritical checkout bar.

RBAC demo assignment: `admin@example.com` receives `admin`; every other
authenticated user receives `manager`. Replace this with a database or identity
provider role lookup before real production use.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Current automated coverage includes inventory card rules, cart store behavior
and persistence, product API/UI states, route protection, navbar user/logout UI,
checkout success/failure, and API route behavior.

## Deployment

Deploy to Vercel with the same environment variables as local development,
using the deployed domain for `NEXTAUTH_URL` and Google OAuth callback URL.
The internal route handlers and middleware are Vercel-compatible.

Live demo URL:

```text
https://replace-with-your-live-demo.vercel.app
```

## Repository Structure

```text
app/
  api/
    auth/[...nextauth]/route.ts
    checkout/route.ts
    products/route.ts
  dashboard/
    cart/page.tsx
    layout.tsx
    not-found.tsx
    page.tsx
  login/page.tsx
components/
  CheckoutBar.tsx
  LoginForm.tsx
  Navbar.tsx
  ProductCard.tsx
  ProductGrid.tsx
  Providers.tsx
lib/
  auth.ts
  routeProtection.ts
store/
  cartStore.ts
types/
  next-auth.d.ts
  product.ts
__tests__/
middleware.ts
```

## Known Limitations

- Google sign-in requires your real Google OAuth client credentials.
- The RBAC role assignment is a safe demo placeholder, not a real role source.
- Product and checkout APIs are mock route handlers, not a real commerce
  backend.
- The build currently reports Auth.js/Jose edge-runtime warnings for
  `CompressionStream`/`DecompressionStream`; the production build still
  succeeds.
