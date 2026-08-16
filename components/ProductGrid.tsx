"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { toast } from "sonner";

type Status = "loading" | "success" | "error";

interface ProductsResponse {
  products: Product[];
  total: number;
  error?: string;
}

export default function ProductGrid(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const fetchProducts = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as ProductsResponse;
      if (!Array.isArray(data.products)) {
        throw new Error("Invalid product response");
      }
      setProducts(data.products);
      setStatus("success");
    } catch {
      setStatus("error");
      toast.error("Product catalog could not be loaded.");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (status === "loading") return <SkeletonLoader />;
  if (status === "error") return <ErrorState onRetry={fetchProducts} />;
  if (products.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
