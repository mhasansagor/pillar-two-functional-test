# Pillar 2 - Functional Engineering Test

Secure product dashboard built with Next.js 14 App Router, strict TypeScript,
Tailwind CSS, Auth.js/NextAuth.js v5 Google OAuth, Zustand cart state,
Sonner notifications, and internal Route Handlers for mock commerce APIs.

## Technology Stack

- Next.js 14 App Router and React 18
- Strict TypeScript with `.ts` and `.tsx` source files only
- Tailwind CSS
- Auth.js / NextAuth.js v5 with Google OAuth and JWT sessions
- Zustand with persisted, per-user cart storage
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

Do not commit `.env`, `.env.local`, or real OAuth secrets. They are ignored by
`.gitignore`.

## Routes

- `/` redirects to `/dashboard` or `/login` based on session.
- `/login` is public and redirects authenticated users through middleware.
- `/dashboard` is protected and renders the paginated product dashboard.
- `/dashboard/cart` is protected and renders cart review and checkout.
- `/dashboard/admin/inventory` is admin-only and renders inventory reporting.
- `/api/auth/[...nextauth]` handles Auth.js routes.
- `/api/products` returns typed mock products with filters and pagination.
- `/api/checkout` verifies session and simulates checkout processing.

Unknown routes under `/dashboard` show `app/dashboard/not-found.tsx`.

## Authentication And RBAC

Authentication is configured in `lib/auth.ts` using Google OAuth and JWT
sessions. `middleware.ts` wraps Auth.js middleware and delegates redirect
decisions to `lib/routeProtection.ts`, preserving the requested dashboard URL
in `callbackUrl`. `app/dashboard/layout.tsx` also checks the session on the
server as a second layer.

Demo role assignment:

- `exampleadmin@email.com` receives `admin`.
- Every other authenticated user receives `manager`.

This is a safe assessment/demo placeholder. Replace it with a database or
identity-provider role lookup before real production use.

## Product Catalog

The product source of truth is `lib/productCatalog.ts`. It contains 50 typed
products across six categories:

- Laptops
- Accessories
- Mobile
- Tab
- Gadget
- Home Appliance

Product images are loaded from `adminapi.applegadgetsbd.com`, configured in
`next.config.mjs` through `images.remotePatterns`.

## Product API

`app/api/products/route.ts` returns:

- `products: Product[]`
- `total: number`
- `categories: ProductCategory[]`
- `page: number`
- `perPage: number`
- `totalPages: number`
- optional user-safe `error`

Supported query parameters:

- `page`: positive page number
- `perPage`: positive page size, capped at 20
- `category`: one of the known product categories
- `search`: product-name search
- `state=empty`: deterministic empty response for tests
- `state=error`: deterministic error response for tests

The dashboard requests 20 products per page. With 50 products, page 1 shows 20,
page 2 shows 20, and page 3 shows the remaining 10.

## Dashboard Features

- Search by product name
- Category filtering behind an accessible filter button
- Numbered pagination with chevrons and ellipsis
- Skeleton loading state
- Friendly empty state
- Retryable error state
- Stock badges for low-stock and out-of-stock products
- Buy button that adds the product and redirects to the cart
- Icon-only add-to-cart button with accessible labels

## Inventory Rules

Implemented through `getStockStatus` in `types/product.ts`.

- `stock === 0`: shows "Out of Stock", disables add/buy, sets `aria-disabled`.
- `0 < stock < 5`: shows "Low Stock", remaining count, add/buy enabled.
- `stock >= 5`: normal state, add/buy enabled, no low-stock badge.

Cart quantity can never exceed stock, cannot go negative, and removes the item
when decreased below one.

## Cart And Checkout

The cart is managed in `store/cartStore.ts`. Zustand was selected instead of
Redux or Context API because the shared state is focused, action-heavy cart
state. Zustand gives small selectors, simple actions, and persistence without
Redux boilerplate or Context-wide rerenders.

Cart persistence is isolated by authenticated identity:

- Authenticated users store cart data under
  `pillar-2-cart:<encoded-normalized-email>`.
- Guests store cart data under `pillar-2-cart:guest`.
- `components/Providers.tsx` waits for Auth.js session resolution, changes the
  persisted storage key, and then rehydrates the cart.

Checkout verifies the current server session through `POST /api/checkout`.
Authenticated checkout enters a loading state, blocks repeated clicks, waits
about 1500ms in the route handler, clears the cart on success, and preserves
the cart on failure. Failure is deterministic for tests through the
`x-force-fail: true` request header.

## Admin Inventory Dashboard

Admins can open `/dashboard/admin/inventory` from the dashboard. The page shows:

- Total product count
- Total stock count
- Low-stock count
- Stockout count
- Product count, stock, and stockout totals by category
- Stockout product list
- Full product stock ledger with category, price, quantity, and status

Non-admin users receive the dashboard not-found page for this route.

## Completed Bonus Features

- Edge middleware route protection for `/dashboard` and `/dashboard/:path*`
- Server-side route protection in `app/dashboard/layout.tsx`
- Hydration-safe, per-user Zustand cart persistence
- RBAC demo roles on Auth.js JWT/session
- Admin inventory dashboard
- API-level filtering, search, and pagination
- Dynamic import/code splitting for the noncritical checkout bar
- Typed catalog and stock-status helpers
- Focused test coverage for API, UI states, cart behavior, persistence, and
  route protection

## Validation

Run before submission:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Latest local validation:

- `npm.cmd run lint`: passed
- `npm.cmd run typecheck`: passed
- `npm.cmd run test`: passed, 4 files / 11 tests
- `npm.cmd run build`: passed

The production build currently reports non-fatal Auth.js/Jose Edge Runtime
warnings for `CompressionStream` and `DecompressionStream`. The build still
completes successfully.

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
    admin/inventory/page.tsx
    cart/page.tsx
    layout.tsx
    not-found.tsx
    page.tsx
  login/page.tsx
components/
  CheckoutBar.tsx
  EmptyState.tsx
  ErrorState.tsx
  LoginForm.tsx
  Navbar.tsx
  ProductCard.tsx
  ProductGrid.tsx
  Providers.tsx
  SkeletonLoader.tsx
lib/
  auth.ts
  cartStorage.ts
  productCatalog.ts
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

- Google sign-in requires real Google OAuth client credentials.
- The RBAC role assignment is a safe demo placeholder, not a real role source.
- Product and checkout APIs are mock route handlers, not a real commerce
  backend.
- The live demo URL must be replaced after deployment.
- Existing Auth.js/Jose Edge Runtime warnings appear during build but do not
  block production compilation.
