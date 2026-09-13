import { useEffect, useState } from "react";
import {
  doc,
  runTransaction,
  collection,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Order, OrderDraft, OrderStatus } from "../types";

// "YYYY-MM-DD" in Asia/Bangkok, NOT the server/browser's local date — a
// customer ordering near midnight from a different timezone must not get
// tomorrow's counter.
function bangkokDateKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d); // en-CA formats as YYYY-MM-DD
}

/**
 * Creates an order with a guaranteed-unique, sequential queue number.
 *
 * Why a transaction: if two customers tap "confirm" in the same instant,
 * a plain read-then-write on `dailyCounters` would let both read
 * lastQueueNumber = 12 and both write #13. runTransaction retries
 * automatically on conflict, so the counter increment and the order
 * creation succeed or fail together — no duplicate or skipped numbers.
 */
export async function createOrder(
  draft: OrderDraft,
  checkout: {
    customerName: string;
    hasPolaroidDiscount: boolean;
    finalTotal: number;
  }
): Promise<string> {
  const dateKey = bangkokDateKey();
  const counterRef = doc(db, "dailyCounters", dateKey);
  const orderRef = doc(collection(db, "orders"));

  await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const nextQueueNumber = counterSnap.exists()
      ? counterSnap.data().lastQueueNumber + 1
      : 1;

    tx.set(
      counterRef,
      { date: dateKey, lastQueueNumber: nextQueueNumber },
      { merge: true }
    );

    const order: Omit<Order, "id" | "createdAt" | "updatedAt" | "servedAt"> & {
      createdAt: unknown;
      updatedAt: unknown;
      servedAt: null;
    } = {
      queueNumber: nextQueueNumber,
      customerName: checkout.customerName,
      moodId: draft.mood.id,
      drinkName: draft.mood.drinkName, // snapshot — see types.ts note
      addons: draft.addons,
      sweetnessLevel: draft.sweetnessLevel,
      totalPrice: checkout.finalTotal,
      hasPolaroidDiscount: checkout.hasPolaroidDiscount,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      servedAt: null,
    };

    tx.set(orderRef, order);
  });

  return orderRef.id;
}

// Live status for the customer's own order — this is what makes Page 5
// update from "pending" to "ready" without any polling or refresh.
export function useOrderStatus(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setOrder({
        id: snap.id,
        ...data,
        createdAt: toMillis(data.createdAt),
        updatedAt: toMillis(data.updatedAt),
        servedAt: data.servedAt ? toMillis(data.servedAt) : null,
      } as Order);
    });
    return unsubscribe;
  }, [orderId]);

  return order;
}

function toMillis(ts: Timestamp | undefined): number {
  return ts ? ts.toMillis() : Date.now();
}

export type { OrderStatus };
