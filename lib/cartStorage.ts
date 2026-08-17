const CART_STORAGE_PREFIX = "pillar-2-cart";

export function getCartStorageKey(email?: string | null): string {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return `${CART_STORAGE_PREFIX}:guest`;
  }

  return `${CART_STORAGE_PREFIX}:${encodeURIComponent(normalizedEmail)}`;
}
