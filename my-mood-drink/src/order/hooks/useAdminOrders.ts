import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Order, OrderStatus } from "../types";

function fromFirestore(id: string, data: any): Order {
  return {
    id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
    servedAt: data.servedAt ? (data.servedAt as Timestamp).toMillis() : null,
  };
}

// Kitchen Display (Page A): orders still in the pipeline, oldest first.
// This requires a composite index on (status, queueNumber) — Firestore
// will show a "create index" link in the console the first time this runs.
export function useActiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["pending", "making"]),
      orderBy("queueNumber", "asc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => fromFirestore(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        console.error("useActiveOrders subscription failed:", err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { orders, loading };
}

// Queue Management (Page B): every order created today, any status —
// used for the pending/ready/completed summary counts and the full list.
export function useTodayOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("queueNumber", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => fromFirestore(d.id, d.data())));
    });
    return unsubscribe;
  
  }, []);

  return orders;
}

// Called from the barista's "กำลังทำ → พร้อมเสิร์ฟ" button, and from
// Queue Management for manual status corrections.
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    ...(status === "ready" ? { servedAt: null } : {}),
    ...(status === "completed" ? { servedAt: serverTimestamp() } : {}),
  });
}

function bangkokDateKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// "จบวัน" button on Queue Management: archives every order in `orders`
// into `orderHistory` (so sales history survives) then clears `orders`
// and resets today's counter, so tomorrow starts back at #1.
//
// Firestore has no server-side "move collection" op, so this is
// read-all → batched write → batched delete. Batches cap at 500 writes,
// which is generous for a single day's queue at this shop's scale; if
// that ever gets tight, chunk `snap.docs` into groups of ~200 and run
// multiple batches instead of one.
export async function resetDay(): Promise<number> {
  const snap = await getDocs(collection(db, "orders"));
  if (snap.empty) return 0;

  const batch = writeBatch(db);
  snap.docs.forEach((docSnap) => {
    const historyRef = doc(db, "orderHistory", docSnap.id);
    batch.set(historyRef, { ...docSnap.data(), archivedAt: serverTimestamp() });
    batch.delete(docSnap.ref);
  });
  await batch.commit();

  await deleteDoc(doc(db, "dailyCounters", bangkokDateKey()));

  return snap.size;
}

// "Clear Completed" on Queue Management — archives just the finished
// orders, leaving pending/making/ready (and the queue counter) untouched.
// Smaller, safer sibling of resetDay() for mid-shift cleanup.
export async function clearCompletedOrders(): Promise<number> {
  const q = query(collection(db, "orders"), where("status", "==", "completed"));
  const snap = await getDocs(q);
  if (snap.empty) return 0;

  const batch = writeBatch(db);
  snap.docs.forEach((docSnap) => {
    const historyRef = doc(db, "orderHistory", docSnap.id);
    batch.set(historyRef, { ...docSnap.data(), archivedAt: serverTimestamp() });
    batch.delete(docSnap.ref);
  });
  await batch.commit();

  return snap.size;
}