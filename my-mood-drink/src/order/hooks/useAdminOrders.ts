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
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { syncOrderToGoogleSheet } from "../../services/googleSheets";
import type { Order, OrderItem, OrderStatus } from "../types";

export function fromFirestore(id: string, data: DocumentData): Order {
  const legacyItem: OrderItem = {
    moodId: typeof data.moodId === "string" ? data.moodId : "",
    drinkname: typeof data.drinkname === "string" ? data.drinkname : data.drinkName,
    addons: Array.isArray(data.addons) ? data.addons : [],
    sweetnessLevel: data.sweetnessLevel === "หวานมากพิเศษ" ? "หวานมากพิเศษ" : "ปกติ",
    price: typeof data.totalPrice === "number" ? data.totalPrice : 0,
  };
  const items: OrderItem[] = Array.isArray(data.items)
    ? data.items.map((item: Partial<OrderItem>) => ({
      moodId: typeof item.moodId === "string" ? item.moodId : "",
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
      drinkname: typeof item.drinkname === "string" ? item.drinkname : undefined,
      drinkName: typeof item.drinkName === "string" ? item.drinkName : undefined,
      addons: Array.isArray(item.addons) ? item.addons : [],
      sweetnessLevel: item.sweetnessLevel === "หวานมากพิเศษ" ? "หวานมากพิเศษ" : "ปกติ",
      price: typeof item.price === "number" ? item.price : 0,
    }))
    : (data.moodId || data.drinkname || data.drinkName ? [legacyItem] : []);

  return {
    id,
    queueNumber: typeof data.queueNumber === "number" ? data.queueNumber : 0,
    customerName: typeof data.customerName === "string" ? data.customerName : "ลูกค้า",
    fulfillmentMethod: data.fulfillmentMethod === "delivery" ? "delivery" : "pickup",
    requestedAt: typeof data.requestedAt === "string" ? data.requestedAt : undefined,
    deliveryLocation: typeof data.deliveryLocation === "string" ? data.deliveryLocation : undefined,
    items,
    totalPrice: typeof data.totalPrice === "number" ? data.totalPrice : 0,
    promotionDiscount: typeof data.promotionDiscount === "number" ? data.promotionDiscount : undefined,
    hasPolaroidDiscount: Boolean(data.hasPolaroidDiscount),
    status: data.status === "making" || data.status === "ready" || data.status === "completed" || data.status === "cancelled" ? data.status : "pending",
    paymentStatus: data.paymentStatus,
    paymentMessage: data.paymentMessage,
    createdAt: (data.createdAt as Timestamp)?.toMillis?.() ?? Date.now(),
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? Date.now(),
    servedAt: data.servedAt ? (data.servedAt as Timestamp).toMillis() : null,
  };
}

export type HistoryOrder = Order & { archivedAt: number };

export type DeletedOrderHistoryRecord = {
  id: string;
  originalOrderId: string;
  order: Order | null;
  slipImageData?: string;
  slipSubmittedAt: number;
  deletedAt: number;
  deletionReason: "payment_rejected" | "orphan_slip";
};

export function useOrderHistory() {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "orderHistory"), orderBy("archivedAt", "desc"));
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((item) => ({
        ...fromFirestore(item.id, item.data()),
        archivedAt: (item.data().archivedAt as Timestamp)?.toMillis?.() ?? Date.now(),
      })));
      setLoading(false);
      setError(null);
    }, (cause) => {
      console.error("Order history subscription failed:", cause);
      setError("โหลดประวัติออเดอร์ไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firebase");
      setLoading(false);
    });
  }, []);

  return { orders, loading, error };
}

export function useDeletedOrderHistory() {
  const [records, setRecords] = useState<DeletedOrderHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "deletedOrderHistory"), orderBy("deletedAt", "desc"));
    return onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((item) => {
        const data = item.data();
        const orderData = data.order as DocumentData | null | undefined;
        const slipData = data.slip as DocumentData | null | undefined;
        return {
          id: item.id,
          originalOrderId: typeof data.originalOrderId === "string" ? data.originalOrderId : item.id,
          order: orderData ? fromFirestore(item.id, orderData) : null,
          slipImageData: typeof slipData?.imageData === "string" ? slipData.imageData : undefined,
          slipSubmittedAt: (slipData?.submittedAt as Timestamp)?.toMillis?.() ?? 0,
          deletedAt: (data.deletedAt as Timestamp)?.toMillis?.() ?? Date.now(),
          deletionReason: data.deletionReason === "payment_rejected" ? "payment_rejected" : "orphan_slip",
        };
      }));
      setLoading(false);
      setError(null);
    }, (cause) => {
      console.error("Deleted order history subscription failed:", cause);
      setError("โหลดประวัติที่ถูกลบไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firebase");
      setLoading(false);
    });
  }, []);

  return { records, loading, error };
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
  void syncOrderToGoogleSheet({
    orderId,
    status,
    updatedAt: new Date().toISOString(),
  });
}

// Cancel an order when an item is unavailable and remove its uploaded slip.
export async function cancelOrderForOutOfStock(orderId: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "orders", orderId), {
    status: "cancelled",
    paymentMessage: "ออเดอร์ถูกยกเลิกเนื่องจากสินค้าหมด",
    updatedAt: serverTimestamp(),
  });
  batch.delete(doc(db, "paymentSlips", orderId));
  await batch.commit();
  void syncOrderToGoogleSheet({
    orderId,
    status: "cancelled",
    paymentMessage: "ออเดอร์ถูกยกเลิกเนื่องจากสินค้าหมด",
    updatedAt: new Date().toISOString(),
  });
}

export async function archiveAndDeleteRejectedOrder(orderId: string) {
  const currentRef = doc(db, "orders", orderId);
  const historyRef = doc(db, "orderHistory", orderId);
  const slipRef = doc(db, "paymentSlips", orderId);
  const [currentSnap, historySnap, slipSnap] = await Promise.all([
    getDoc(currentRef),
    getDoc(historyRef),
    getDoc(slipRef),
  ]);

  const orderSnap = currentSnap.exists() ? currentSnap : historySnap.exists() ? historySnap : null;
  const orderData = orderSnap?.data() ?? null;
  if (orderData && orderData.paymentStatus !== "rejected") {
    throw new Error("ลบได้เฉพาะออเดอร์ที่ตรวจสลิปไม่ผ่าน");
  }
  if (!orderData && !slipSnap.exists()) {
    throw new Error("ไม่พบออเดอร์หรือสลิปที่ต้องการลบ");
  }

  const batch = writeBatch(db);
  batch.set(doc(db, "deletedOrderHistory", orderId), {
    originalOrderId: orderId,
    order: orderData,
    slip: slipSnap.exists() ? slipSnap.data() : null,
    deletionReason: orderData ? "payment_rejected" : "orphan_slip",
    deletedAt: serverTimestamp(),
  });
  if (currentSnap.exists()) batch.delete(currentRef);
  if (historySnap.exists()) batch.delete(historyRef);
  if (slipSnap.exists()) batch.delete(slipRef);
  await batch.commit();
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
