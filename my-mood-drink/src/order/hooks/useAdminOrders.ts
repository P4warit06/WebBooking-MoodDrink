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
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Order, OrderItem, OrderStatus } from "../types";

function fromFirestore(id: string, data: DocumentData): Order {
  const legacyItem: OrderItem = {
    moodId: typeof data.moodId === "string" ? data.moodId : "",
    drinkname: typeof data.drinkname === "string" ? data.drinkname : data.drinkName,
    addons: Array.isArray(data.addons) ? data.addons : [],
    sweetnessLevel: data.sweetnessLevel === "50%" || data.sweetnessLevel === "หวานมากพิเศษ" ? data.sweetnessLevel : "ปกติ",
    price: typeof data.totalPrice === "number" ? data.totalPrice : 0,
  };
  const items: OrderItem[] = Array.isArray(data.items)
    ? data.items.map((item: Partial<OrderItem>) => ({
      moodId: typeof item.moodId === "string" ? item.moodId : "",
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
      drinkname: typeof item.drinkname === "string" ? item.drinkname : undefined,
      drinkName: typeof item.drinkName === "string" ? item.drinkName : undefined,
      addons: Array.isArray(item.addons) ? item.addons : [],
      sweetnessLevel: item.sweetnessLevel === "50%" || item.sweetnessLevel === "หวานมากพิเศษ" ? item.sweetnessLevel : "ปกติ",
      price: typeof item.price === "number" ? item.price : 0,
    }))
    : (data.moodId || data.drinkname || data.drinkName ? [legacyItem] : []);

  return {
    id,
    queueNumber: typeof data.queueNumber === "number" ? data.queueNumber : 0,
    customerName: typeof data.customerName === "string" ? data.customerName : "ลูกค้า",
    items,
    totalPrice: typeof data.totalPrice === "number" ? data.totalPrice : 0,
    promotionDiscount: typeof data.promotionDiscount === "number" ? data.promotionDiscount : undefined,
    hasPolaroidDiscount: Boolean(data.hasPolaroidDiscount),
    status: data.status === "making" || data.status === "ready" || data.status === "completed" || data.status === "cancelled" ? data.status : "pending",
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
    servedAt: data.servedAt ? (data.servedAt as Timestamp).toMillis() : null,
  };
}

// Subscribe to the current queue and surface connection errors to the UI.
export function useTodayOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("queueNumber", "asc"));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => fromFirestore(d.id, d.data())));
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Orders subscription failed:", err);
      setError("โหลดข้อมูลคิวไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อและสิทธิ์ Firebase");
      setLoading(false);
    });
  }, []);

  return { orders, loading, error };
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
