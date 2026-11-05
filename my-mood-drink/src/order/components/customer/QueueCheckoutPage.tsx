import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle, ReceiptText, UserRound } from "lucide-react";
import { createOrder } from "../../hooks/useOrder";
import type { Mood, OrderDraft, OrderItem } from "../../types";
import { moodDrinkName } from "../../utils/menu";
import { OrderFlowHeader } from "../shared/OrderFlowHeader";
import { OrderItems } from "../shared/OrderItems";
import { OrderTotals } from "../shared/OrderTotals";

interface QueueCheckoutPageProps {
  moods: Mood[];
  orderDraft: OrderDraft;
  onBack: () => void;
  onSubmitted: (orderId: string) => void;
}

export function QueueCheckoutPage({ orderDraft, onBack, onSubmitted }: QueueCheckoutPageProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionLock = useRef(false);
  const items: OrderItem[] = orderDraft.items.map(item => ({
    moodId: item.mood.id, drinkname: moodDrinkName(item.mood), imageUrl: item.mood.imageUrl,
    addons: item.addons, sweetnessLevel: item.sweetnessLevel, price: item.total,
  }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || submissionLock.current) return;
    submissionLock.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const orderId = await createOrder(orderDraft, {
        customerName: name.trim(), hasPolaroidDiscount: false, finalTotal: orderDraft.grandTotal,
      });
      onSubmitted(orderId);
    } catch (cause) {
      console.error(cause);
      setError("ส่งออเดอร์ไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  return <main className="clay-order-page">
    <OrderFlowHeader step={3} onBack={submitting ? undefined : onBack} />
    <div className="order-page-intro"><span className="eyebrow">ALMOST YOURS</span><h1>เช็กแก้วโปรด ก่อนรับคิว</h1><p>อีกนิดเดียว เครื่องดื่มที่ใช่ก็พร้อมส่งให้บาร์แล้ว</p></div>
    <form onSubmit={handleSubmit} className="checkout-layout" aria-busy={submitting}>
      <section className="order-clay-card checkout-items">
        <div className="clay-section-heading"><span className="clay-section-icon"><ReceiptText size={21} /></span><div><h2>แก้วโปรดของคุณ</h2><p>{items.length} แก้ว · ปรับแต่งตามใจแล้ว</p></div></div>
        <OrderItems items={items} />
        {items.length === 3 && <p className="order-footnote">ราคาแต่ละแก้วด้านบนเป็นราคาก่อนโปรโมชั่น</p>}
      </section>
      <div className="checkout-side">
        <section className="order-clay-card">
          <div className="clay-section-heading"><span className="clay-section-icon peach"><UserRound size={21} /></span><div><h2>ให้เราเรียกคุณว่าอะไรดี</h2><p>ใช้สำหรับเรียกคิวรับเครื่องดื่ม</p></div></div>
          <label className="clay-label" htmlFor="queue-name">ชื่อเล่น หรือเบอร์โต๊ะ</label>
          <input id="queue-name" name="customerName" autoComplete="given-name" className="order-clay-input" value={name} onChange={e => setName(e.target.value)} placeholder="เช่น มายด์ / โต๊ะ 3" required disabled={submitting} />
        </section>
        <section className="order-clay-card"><h2 className="clay-section-title">สรุปยอดของคุณ</h2><OrderTotals items={items} total={orderDraft.grandTotal} promotionDiscount={orderDraft.promotionDiscount} /></section>
        {error && <p role="alert" className="order-error">{error}</p>}
        <button className="clay-button primary" disabled={!name.trim() || submitting} type="submit">{submitting ? <><LoaderCircle size={20} className="animate-spin" /> กำลังส่งออเดอร์...</> : <>ยืนยันและรับคิว <ArrowRight size={20} /></>}</button>
        <p className="order-footnote text-center">ตรวจรายละเอียดให้ครบก่อนยืนยันนะ ♡</p>
      </div>
    </form>
  </main>;
}
