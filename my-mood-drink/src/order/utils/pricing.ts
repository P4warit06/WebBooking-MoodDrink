import type { OrderDraftItem } from "../types";

/** The promotion covers the base price of three drinks; add-ons stay at full price. */
export function calculatePricing(items: OrderDraftItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const baseTotal = items.reduce((sum, item) => sum + item.mood.basePrice, 0);
  const promotionDiscount = items.length === 3 ? baseTotal - 100 : 0;
  return { subtotal, promotionDiscount, grandTotal: subtotal - promotionDiscount };
}
