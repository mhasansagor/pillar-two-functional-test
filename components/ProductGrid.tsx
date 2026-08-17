"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/types/product";
import ProductCard from "./ProductCard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { toast } from "sonner";

type Status = "loading" | "success" | "error";

interface ProductsResponse {
  products: Product[];
  total: number;
  categories: ProductCategory[];
  page?: number;
  perPage?: number;
  totalPages?: number;
  error?: string;
}

const PRODUCTS_PER_PAGE = 20;

export default function ProductGrid({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "All">(
    "All"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    setStatus("loading");
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("perPage", String(PRODUCTS_PER_PAGE));
      if (selectedCategory !== "All") {
        params.set("category", selectedCategory);
      }
      const trimmedSearch = searchQuery.trim();
      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      const query = params.toString();
      const res = await fetch(`/api/products${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as ProductsResponse;
      if (!Array.isArray(data.products)) {
        throw new Error("Invalid product response");
      }
      setProducts(data.products);
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      setTotalProducts(data.total ?? data.products.length);
      setTotalPages(data.totalPages ?? 1);
      setCurrentPage(data.page ?? currentPage);
      setStatus("success");
    } catch {
      setStatus("error");
      toast.error("Product catalog could not be loaded.");
    }
  }, [currentPage, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalStock = products.reduce(
    (sum, product) => sum + product.stock,
    0
  );
  const outOfStockCount = products.filter(
    (product) => product.stock === 0
  ).length;
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock < 5
  ).length;
  const pageStart = totalProducts === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);

  const handleCategoryChange = (value: ProductCategory | "All"): void => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string): void => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-ink">Products</h2>
            <p className="mt-1 text-sm text-muted">
              Showing {pageStart}-{pageEnd} of {totalProducts} item(s)
            </p>
          </div>

          <div className="flex gap-2 sm:min-w-[360px]">
            <label className="relative flex-1">
              <span className="sr-only">Search products</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search products"
                className="h-11 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>

            <button
              type="button"
              aria-label="Show filters"
              aria-expanded={isFiltersOpen}
              onClick={() => setIsFiltersOpen((value) => !value)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-ink shadow-sm transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 5h18" />
                <path d="M7 12h10" />
                <path d="M10 19h4" />
              </svg>
            </button>
          </div>
        </div>

        {isFiltersOpen && (
          <div className="grid gap-3 border-t border-border pt-4 sm:max-w-[280px]">
            <label className="block">
              <span className="sr-only">Category</span>
              <select
                value={selectedCategory}
                onChange={(event) =>
                  handleCategoryChange(event.target.value as ProductCategory | "All")
                }
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {isAdmin && (
          <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
            <InventoryMetric label="Page Products" value={products.length} />
            <InventoryMetric label="Page Stock" value={totalStock} />
            <InventoryMetric
              label="Page Alerts"
              value={outOfStockCount + lowStockCount}
            />
          </div>
        )}
      </div>

      {status === "loading" && <SkeletonLoader />}
      {status === "error" && <ErrorState onRetry={fetchProducts} />}
      {status === "success" && products.length === 0 && <EmptyState />}
      {status === "success" && products.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {status === "success" && totalProducts > 0 && (
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
}

function InventoryMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}): JSX.Element {
  return (
    <div className="rounded-lg bg-surface p-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function ProductPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}): JSX.Element {
  const pages = getPaginationItems(currentPage, totalPages);

  return (
    <nav
      aria-label="Product pagination"
      className="flex items-center justify-center gap-2 py-2"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        aria-label="Go to previous page"
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {pages.map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            aria-label={`Go to page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
              item === currentPage
                ? "bg-slate-100 text-ink"
                : "text-ink hover:bg-surface"
            }`}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center text-sm text-muted"
          >
            ...
          </span>
        )
      )}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        aria-label="Go to next page"
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

function getPaginationItems(
  currentPage: number,
  totalPages: number
): Array<number | string> {
  if (totalPages <= 12) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const firstPages = [1, 2, 3, 4, 5, 6, 7, 8];
  const lastPages = [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];

  if (currentPage <= 6) {
    return [...firstPages, "end-ellipsis", ...lastPages];
  }

  if (currentPage >= totalPages - 5) {
    return [1, 2, 3, 4, "start-ellipsis", ...lastPages];
  }

  return [
    1,
    "start-ellipsis",
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
    "end-ellipsis",
    ...lastPages,
  ];
}
