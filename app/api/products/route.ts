import { NextResponse } from "next/server";
import type { Product } from "@/types/product";

const products: Product[] = [
  {
    id: 1,
    name: "MacBook Pro M2",
    category: "Laptops",
    price: 2499,
    stock: 8,
    image: "/assets/images/macbook-pro-m2.jpg",
  },
  {
    id: 2,
    name: "Logitech MX Master 3",
    category: "Accessories",
    price: 99,
    stock: 0,
    image: "/assets/images/logitech-mx-master.jpg",
  },
  {
    id: 3,
    name: "Dell XPS 15",
    category: "Laptops",
    price: 1899,
    stock: 3,
    image: "/assets/images/dell-xps-15.jpg",
  },
];

export interface ProductsResponse {
  products: Product[];
  total: number;
  error?: string;
}

export async function GET(request: Request): Promise<NextResponse<ProductsResponse>> {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get("state");

    if (state === "error") {
      throw new Error("Forced product API failure");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (state === "empty") {
      return NextResponse.json({ products: [], total: 0 }, { status: 200 });
    }

    return NextResponse.json(
      {
        products,
        total: products.length,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        products: [],
        total: 0,
        error: "The product catalog is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}
