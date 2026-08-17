import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { productCategories, products } from "@/lib/productCatalog";
import { formatCurrency, getStockStatus } from "@/types/product";
import type { ProductCategory } from "@/types/product";

interface CategorySummary {
  category: ProductCategory;
  products: number;
  stock: number;
  stockout: number;
}

export default async function AdminInventoryPage(): Promise<JSX.Element> {
  const session = await auth();

  if (session?.user.role !== "admin") {
    notFound();
  }

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const stockoutProducts = products.filter((product) => product.stock === 0);
  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock < 5
  );
  const categorySummaries: CategorySummary[] = productCategories.map((category) => {
    const categoryProducts = products.filter(
      (product) => product.category === category
    );

    return {
      category,
      products: categoryProducts.length,
      stock: categoryProducts.reduce((sum, product) => sum + product.stock, 0),
      stockout: categoryProducts.filter((product) => product.stock === 0).length,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Admin Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            Inventory Overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track product quantities by category and identify stockout items.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:bg-surface"
        >
          Back to Products
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InventoryCard label="Products" value={products.length} />
        <InventoryCard label="Total Stock" value={totalStock} />
        <InventoryCard label="Low Stock" value={lowStockProducts.length} />
        <InventoryCard label="Stockout" value={stockoutProducts.length} tone="danger" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Inventory by Category
              </h2>
              <p className="text-sm text-muted">
                Product count, total stock, and stockout count per category.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase text-muted">
                  <th scope="col" className="px-3 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Products
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Stock
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Stockout
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categorySummaries.map((summary) => (
                  <tr key={summary.category}>
                    <td className="px-3 py-3 font-medium text-ink">
                      {summary.category}
                    </td>
                    <td className="px-3 py-3 text-muted">{summary.products}</td>
                    <td className="px-3 py-3 text-muted">{summary.stock}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          summary.stockout > 0
                            ? "font-semibold text-red-700"
                            : "text-muted"
                        }
                      >
                        {summary.stockout}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-ink">Stockout Products</h2>
          <p className="mt-1 text-sm text-muted">
            Items unavailable for customer purchase.
          </p>

          <div className="mt-4 space-y-3">
            {stockoutProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-red-100 bg-red-50 p-3"
              >
                <p className="text-sm font-semibold text-red-900">
                  {product.name}
                </p>
                <p className="mt-1 text-xs font-medium text-red-700">
                  {product.category} - 0 in stock
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold text-ink">Product Stock Ledger</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase text-muted">
                <th scope="col" className="px-3 py-3">
                  Product
                </th>
                <th scope="col" className="px-3 py-3">
                  Category
                </th>
                <th scope="col" className="px-3 py-3">
                  Price
                </th>
                <th scope="col" className="px-3 py-3">
                  Stock
                </th>
                <th scope="col" className="px-3 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const stock = getStockStatus(product.stock);

                return (
                  <tr key={product.id}>
                    <td className="max-w-[360px] px-3 py-3 font-medium text-ink">
                      {product.name}
                    </td>
                    <td className="px-3 py-3 text-muted">{product.category}</td>
                    <td className="px-3 py-3 text-muted">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-3 py-3 text-muted">{product.stock}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          stock.label
                            ? stock.badgeClass
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {stock.label ?? "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InventoryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "danger";
}): JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          tone === "danger" ? "text-red-700" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
