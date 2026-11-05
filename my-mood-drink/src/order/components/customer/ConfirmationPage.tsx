import { Check, Clock3, Home, LoaderCircle, MessageCircleHeart, Plus, ReceiptText } from "lucide-react";
import { useOrderStatus } from "../../hooks/useOrder";
import { useMoods } from "../../hooks/useMood";
import type { Mood, Order } from "../../types";
import { OrderFlowHeader } from "../shared/OrderFlowHeader";
import { OrderItems } from "../shared/OrderItems";
import { OrderTotals } from "../shared/OrderTotals";

interface ConfirmationPageProps {
  orderId: string;
  onAddAnother: () => void;
  onHome: () => void;
  onFeedback: () => void;
}

const statuses = {
  pending: { title: "รับออเดอร์ของคุณแล้ว", text: "กำลังรอคิวจัดเตรียม แก้วโปรดใกล้เข้ามาแล้ว", step: 1 },
  making: { title: "กำลังทำแก้วโปรดของคุณ", text: "บาริสต้ากำลังเติมความอร่อยให้ทุกแก้ว", step: 2 },
  ready: { title: "เครื่องดื่มพร้อมแล้ว!", text: "แสดงหมายเลขคิวนี้ที่เคาน์เตอร์เพื่อรับเครื่องดื่ม", step: 3 },
  completed: { title: "ส่งมอบความสดใสแล้ว", text: "ขอบคุณที่ให้ Mood Drink เป็นส่วนหนึ่งของวันนี้", step: 3 },
  cancelled: { title: "ออเดอร์ถูกยกเลิก", text: "ติดต่อพนักงานหากต้องการสอบถามเพิ่มเติม", step: 0 },
};

export function ConfirmationPage({ orderId, ...actions }: ConfirmationPageProps) {
  const order = useOrderStatus(orderId);
  const { moods } = useMoods(true);
  if (!order) return <main className="clay-order-page"><OrderFlowHeader step={4} /><div role="status" className="order-clay-card order-loading"><LoaderCircle className="animate-spin" size={28} /> กำลังโหลดสถานะคิว...</div></main>;
  return <OrderConfirmation order={order} moods={moods} {...actions} />;
}

export function OrderConfirmation({ order, moods, onAddAnother, onHome, onFeedback }: {
  order: Order; moods: Mood[];
} & Omit<ConfirmationPageProps, "orderId">) {
  const status = statuses[order.status] || statuses.pending;
  const ready = order.status === "ready" || order.status === "completed";
  return <main className="clay-order-page">
    <OrderFlowHeader step={4} />
    <div className="confirmation-layout">
      <section className={`order-clay-card queue-ticket ${ready ? "is-ready" : ""} ${order.status === "cancelled" ? "is-cancelled" : ""}`}>
        <span className="eyebrow">A HAPPY SIP IS ON THE WAY</span><h1>คิวของคุณ</h1>
        <div className="queue-number">#{String(order.queueNumber).padStart(2, "0")}</div>
        <p className="queue-owner">คุณ {order.customerName || "ลูกค้า"} · {order.items?.length || 0} แก้ว</p>
        <div className="queue-status" role="status" aria-live="polite"><span className="queue-status-icon">{ready ? <Check size={24} /> : <Clock3 size={24} />}</span><h2>{status.title}</h2><p>{status.text}</p></div>
        {order.status !== "cancelled" && <ol className="queue-progress" aria-label="สถานะออเดอร์">{["รับออเดอร์", "กำลังทำ", "พร้อมรับ"].map((label, index) => <li className={status.step >= index + 1 ? "done" : ""} key={label}><span>{status.step > index + 1 || ready ? <Check size={13} /> : index + 1}</span>{label}</li>)}</ol>}
      </section>
      <section className="order-clay-card confirmation-receipt">
        <div className="clay-section-heading"><span className="clay-section-icon"><ReceiptText size={21} /></span><div><h2>สรุปแก้วโปรด</h2><p>รายการที่ส่งให้บาร์เรียบร้อยแล้ว</p></div></div>
        {order.items?.length ? <OrderItems items={order.items} moods={moods} /> : <p className="order-footnote">ไม่มีรายละเอียดเครื่องดื่ม</p>}
        <OrderTotals items={order.items || []} total={order.totalPrice} promotionDiscount={order.promotionDiscount} />
      </section>
    </div>
    <div className="confirmation-actions"><button className="clay-button secondary" onClick={onAddAnother}><Plus size={19} /> สั่งแก้วเพิ่มให้เพื่อน</button><button className="clay-button primary" onClick={onFeedback}><MessageCircleHeart size={19} /> บอกความรู้สึกกับเรา</button></div>
    <button className="order-home-link" onClick={onHome}><Home size={15} /> กลับหน้าหลัก</button>
  </main>;
}
