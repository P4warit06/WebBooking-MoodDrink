import { useEffect, useState } from "react";
import { Bell, Check, LoaderCircle, X } from "lucide-react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { syncOrderToGoogleSheet } from "../../../services/googleSheets";
import { useTodayOrders } from "../../hooks/useAdminOrders";
import { formatRequestedTime } from "../../utils/fulfillment";

type Slip = { orderId: string; imageData: string };

export function PaymentNotifications() {
  const { orders } = useTodayOrders();
  const [slips, setSlips] = useState<Slip[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(query(collection(db, "paymentSlips"), orderBy("submittedAt", "desc")), snapshot => {
    setSlips(snapshot.docs.map(item => ({ orderId: item.id, imageData: item.data().imageData as string })));
  }, cause => {
    console.error("Could not load payment notifications:", cause);
    setError("โหลดแจ้งเตือนสลิปไม่สำเร็จ");
  }), []);

  const pending = orders.filter(order => order.paymentStatus === "submitted");
  async function review(orderId: string, approved: boolean) {
    setBusyId(orderId);
    setError("");
    try {
      await updateDoc(doc(db, "orders", orderId), {
        paymentStatus: approved ? "verified" : "rejected",
        paymentMessage: approved ? "พนักงานยืนยันยอดโอนแล้ว" : "สลิปยังไม่ผ่านการตรวจสอบ กรุณาตรวจยอดและบัญชีผู้รับแล้วส่งใหม่",
        updatedAt: serverTimestamp(),
        ...(approved ? { paymentVerifiedAt: serverTimestamp() } : {}),
      });
      void syncOrderToGoogleSheet({
        orderId,
        paymentStatus: approved ? "verified" : "rejected",
        paymentMessage: approved ? "พนักงานยืนยันยอดโอนแล้ว" : "สลิปยังไม่ผ่านการตรวจสอบ กรุณาตรวจยอดและบัญชีผู้รับแล้วส่งใหม่",
        ...(approved ? { paymentVerifiedAt: new Date().toISOString() } : {}),
        updatedAt: new Date().toISOString(),
      });
    } catch (cause) {
      console.error("Payment review failed:", cause);
      setError("บันทึกผลตรวจสลิปไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setBusyId(null);
    }
  }

  return <section className="payment-notifications" aria-label="แจ้งเตือนการชำระเงิน">
    <div className="payment-notification-heading"><Bell size={19} /><strong>สลิปรอตรวจ</strong><span className="payment-notification-count" aria-live="polite">{pending.length}</span></div>
    {error && <p role="alert" className="order-error">{error}</p>}
    {pending.length === 0 ? <p>ยังไม่มีสลิปใหม่</p> : <div className="payment-notification-list">{pending.map(order => {
      const slip = slips.find(item => item.orderId === order.id);
      return <details key={order.id} className="payment-notification-item">
        <summary><span>คิว #{String(order.queueNumber).padStart(2, "0")} · {order.customerName}</span><strong>{order.totalPrice} บาท</strong><span className="payment-new-label">สลิปใหม่</span></summary>
        {slip ? <img src={slip.imageData} alt={`สลิปโอนเงินของคิว ${order.queueNumber}`} /> : <p>กำลังโหลดภาพสลิป...</p>}
        <p>เวลาโดยประมาณ: {formatRequestedTime(order.requestedAt)} · {order.fulfillmentMethod === "delivery" ? `ให้เดินไปส่งที่ ${order.deliveryLocation || "ไม่ได้ระบุ"}` : "รับที่หน้าร้าน"}</p>
        <p>ตรวจยอด {order.totalPrice} บาท ชื่อบัญชีผู้รับ และรายการเงินจริงในแอปธนาคารก่อนกดยืนยัน</p>
        <div className="payment-review-actions"><button type="button" disabled={busyId !== null || !slip} onClick={() => review(order.id, true)}>{busyId === order.id ? <LoaderCircle size={17} className="animate-spin" /> : <Check size={17} />} ยืนยันรับเงิน</button><button type="button" disabled={busyId !== null} onClick={() => review(order.id, false)}><X size={17} /> ไม่ผ่าน</button></div>
      </details>;
    })}</div>}
  </section>;
}
