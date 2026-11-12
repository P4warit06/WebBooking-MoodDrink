/**
 * Optional Google Sheets bridge.
 *
 * The browser must not contain a Google service-account key. Instead, set
 * VITE_GOOGLE_SHEETS_WEBHOOK_URL to a deployed Google Apps Script web-app URL.
 * The Apps Script (see GOOGLE_SHEETS_SETUP.md) writes the payload to the
 * configured spreadsheet and upserts by orderId, so retrying an update does
 * not create duplicate rows.
 */
export type GoogleSheetOrderPatch = {
  orderId: string;
  queueNumber?: number;
  customerName?: string;
  fulfillmentMethod?: "pickup" | "delivery";
  requestedAt?: string;
  deliveryLocation?: string;
  items?: string;
  glasses?: number;
  totalPrice?: number;
  promotionDiscount?: number;
  paymentStatus?: string;
  paymentMessage?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSlipSubmittedAt?: string;
  paymentVerifiedAt?: string;
};

const webhookUrl = (import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string | undefined)?.trim();

export function googleSheetsSyncConfigured(): boolean {
  return Boolean(webhookUrl);
}

export async function syncOrderToGoogleSheet(
  patch: GoogleSheetOrderPatch,
): Promise<void> {
  if (!webhookUrl) return;

  try {
    // text/plain avoids a browser CORS preflight for the Apps Script endpoint.
    // no-cors is intentional: Apps Script may not expose response headers, but
    // the POST is still delivered and the endpoint is idempotent by orderId.
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        source: "mood-drink-web",
        sentAt: new Date().toISOString(),
        ...patch,
      }),
      keepalive: true,
    });
  } catch (cause) {
    // Sheet sync is a secondary reporting path; it must never block a paid
    // order from being created or a staff status update from being saved.
    console.warn("Google Sheets sync skipped:", cause);
  }
}
