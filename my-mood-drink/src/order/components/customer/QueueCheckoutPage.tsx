import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Clock3, LoaderCircle, MapPin, ReceiptText, UserRound } from "lucide-react";
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
  const [requestedAt, setRequestedAt] = useState("");
  const [minRequestedAt] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"pickup" | "delivery">("pickup");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionLock = useRef(false);
  const items: OrderItem[] = orderDraft.items.map(item => ({
    moodId: item.mood.id, drinkname: moodDrinkName(item.mood), imageUrl: item.mood.imageUrl,
    addons: item.addons, sweetnessLevel: item.sweetnessLevel, price: item.total,
  }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !requestedAt || (fulfillmentMethod === "delivery" && !deliveryLocation.trim()) || submissionLock.current) return;
    const requestedTime = new Date(requestedAt);
    if (Number.isNaN(requestedTime.getTime()) || requestedTime.getTime() <= Date.now()) {
      setError("กรุณาเลือกเวลารับเครื่องดื่มที่อยู่ในอนาคต");
      return;
    }
    submissionLock.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const orderId = await createOrder(orderDraft, {
        customerName: name.trim(), hasPolaroidDiscount: false, finalTotal: orderDraft.grandTotal,
        fulfillmentMethod, requestedAt: requestedTime.toISOString(),
        deliveryLocation: fulfillmentMethod === "delivery" ? deliveryLocation.trim() : undefined,
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
        <section className="order-clay-card fulfillment-card">
          <div className="clay-section-heading"><span className="clay-section-icon peach"><Clock3 size={21} /></span><div><h2>รับเครื่องดื่มเมื่อไรดี</h2><p>เลือกเวลาโดยประมาณที่สะดวก</p></div></div>
          <label className="clay-label" htmlFor="requested-at">เวลาที่ต้องการรับ / ให้ส่ง</label>
          <input id="requested-at" className="order-clay-input" type="datetime-local" value={requestedAt} min={minRequestedAt} onChange={event => setRequestedAt(event.target.value)} required disabled={submitting} />
          <fieldset className="fulfillment-choices"><legend className="clay-label">วิธีรับเครื่องดื่ม</legend><label><input type="radio" name="fulfillment" value="pickup" checked={fulfillmentMethod === "pickup"} onChange={() => setFulfillmentMethod("pickup")} disabled={submitting} /> รับที่หน้าร้าน</label><label><input type="radio" name="fulfillment" value="delivery" checked={fulfillmentMethod === "delivery"} onChange={() => setFulfillmentMethod("delivery")} disabled={submitting} /> ให้พนักงานเดินไปส่ง</label></fieldset>
          {fulfillmentMethod === "delivery" ? <><label className="clay-label" htmlFor="delivery-location"><MapPin size={15} /> สถานที่ส่ง</label><textarea id="delivery-location" className="order-clay-input" value={deliveryLocation} onChange={event => setDeliveryLocation(event.target.value)} placeholder="เช่น อาคาร A ชั้น 2 หน้าโต๊ะประชาสัมพันธ์" maxLength={200} rows={3} required disabled={submitting} /></> : <p className="fulfillment-note">หากเครื่องดื่มเสร็จแล้ว สามารถมารับที่หน้าร้านตามเวลาที่เลือกได้ พนักงานจะประกาศเรียกคิวเป็นระยะ ๆ</p>}
          <p className="order-footnote">เวลาที่เลือกเป็นเวลาโดยประมาณ อาจเปลี่ยนตามจำนวนคิว</p>
        </section>
        <section className="order-clay-card"><h2 className="clay-section-title">สรุปยอดของคุณ</h2><OrderTotals items={items} total={orderDraft.grandTotal} promotionDiscount={orderDraft.promotionDiscount} /></section>
        {error && <p role="alert" className="order-error">{error}</p>}
        <button className="clay-button primary" disabled={!name.trim() || !requestedAt || (fulfillmentMethod === "delivery" && !deliveryLocation.trim()) || submitting} type="submit">{submitting ? <><LoaderCircle size={20} className="animate-spin" /> กำลังส่งออเดอร์...</> : <>ยืนยันและรับคิว <ArrowRight size={20} /></>}</button>
        <p className="order-footnote text-center">ตรวจรายละเอียดให้ครบก่อนยืนยันนะ ♡</p>
      </div>
    </form>
  </main>;
}
