import { describe, expect, it } from "vitest";
import { formatCurrency, getStockStatus } from "@/types/product";

describe("product helpers", () => {
  it("maps stock values to display states", () => {
    expect(getStockStatus(0)).toMatchObject({
      level: "out",
      label: "Out of Stock",
      isOutOfStock: true,
    });

    expect(getStockStatus(3)).toMatchObject({
      level: "low",
      label: "Low Stock",
      remainingText: "3 left in stock",
    });

    expect(getStockStatus(8)).toMatchObject({
      level: "in",
      label: null,
      isOutOfStock: false,
    });
  });

  it("formats prices as BDT currency", () => {
    expect(formatCurrency(161999)).toMatch(/BDT\s*161,999/);
  });
});
