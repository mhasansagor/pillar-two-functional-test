import { NextResponse } from "next/server";
import { isProductCategory, productCategories, products } from "@/lib/productCatalog";
import type { Product, ProductCategory } from "@/types/product";

export interface ProductsResponse {
  products: Product[];
  total: number;
  categories: ProductCategory[];
  page: number;
  perPage: number;
  totalPages: number;
  error?: string;
}

function getPositiveParam(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request): Promise<NextResponse<ProductsResponse>> {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get("state");
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const page = getPositiveParam(url.searchParams.get("page"), 1);
    const perPage = Math.min(
      getPositiveParam(url.searchParams.get("perPage"), 18),
      18
    );

    if (state === "error") {
      throw new Error("Forced product API failure");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (state === "empty") {
      return NextResponse.json(
        {
          products: [],
          total: 0,
          categories: productCategories,
          page: 1,
          perPage,
          totalPages: 1,
        },
        { status: 200 }
      );
    }

    const categoryProducts = isProductCategory(category)
      ? products.filter((product) => product.category === category)
      : products;

    const filteredProducts = search
      ? categoryProducts.filter((product) =>
          product.name.toLowerCase().includes(search)
        )
      : categoryProducts;
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * perPage;
    const paginatedProducts = filteredProducts.slice(pageStart, pageStart + perPage);

    return NextResponse.json(
      {
        products: paginatedProducts,
        total: filteredProducts.length,
        categories: productCategories,
        page: safePage,
        perPage,
        totalPages,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        products: [],
        total: 0,
        categories: productCategories,
        page: 1,
        perPage: 18,
        totalPages: 1,
        error: "The product catalog is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}
