export type ProductCategory =
  | "Laptops"
  | "Accessories"
  | "Mobile"
  | "Tab"
  | "Gadget"
  | "Home Appliance";

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image: string;
}

export type StockLevel = "out" | "low" | "in";

export interface StockStatus {
  level: StockLevel;
  label: string | null;
  dotClass: string;
  badgeClass: string;
  isOutOfStock: boolean;
  isLowStock: boolean;
  remainingText: string | null;
}

export function getStockLevel(stock: number): StockLevel {
  if (stock === 0) return "out";
  if (stock < 5) return "low";
  return "in";
}

export function getStockStatus(stock: number): StockStatus {
  const level = getStockLevel(stock);

  if (level === "out") {
    return {
      level,
      label: "Out of Stock",
      dotClass: "bg-red-500",
      badgeClass: "bg-red-100 text-red-700",
      isOutOfStock: true,
      isLowStock: false,
      remainingText: null,
    };
  }

  if (level === "low") {
    return {
      level,
      label: "Low Stock",
      dotClass: "bg-amber-500",
      badgeClass: "bg-amber-100 text-amber-700",
      isOutOfStock: false,
      isLowStock: true,
      remainingText: `${stock} left in stock`,
    };
  }

  return {
    level,
    label: null,
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700",
    isOutOfStock: false,
    isLowStock: false,
    remainingText: null,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}
