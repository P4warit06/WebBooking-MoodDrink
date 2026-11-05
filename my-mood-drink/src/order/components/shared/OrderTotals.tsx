import { TicketPercent } from "lucide-react";
import type { OrderItem } from "../../types";

export function OrderTotals({ items, total, promotionDiscount }: {
  items: OrderItem[];
  total: number;
  promotionDiscount?: number;
}) {
  const toppings = items.reduce((sum, item) => sum + (item.addons || []).reduce((value, addon) => value + addon.price, 0), 0);
  const base = items.reduce((sum, item) => sum + item.price, 0) - toppings;
  const hasPromotion = items.length === 3 && promotionDiscount !== undefined;
  const drinkTotal = base - (promotionDiscount || 0);
  const otherDiscount = drinkTotal + toppings - total;

  return <div className="order-totals">
    {hasPromotion && <div className="clay-promo"><TicketPercent size={21} /><span><strong>ครบ 3 แก้ว รับราคา 100 บาท</strong><small>ท็อปปิ้งคิดเพิ่มตามที่เลือก</small></span></div>}
    <div className="receipt-line"><span>เครื่องดื่ม {items.length} แก้ว{hasPromotion ? " (ราคาโปรโมชั่น)" : ""}</span><span>{drinkTotal} ฿</span></div>
    <div className="receipt-line"><span>ท็อปปิ้งรวม</span><span>{toppings} ฿</span></div>
    {otherDiscount > 0 && <div className="receipt-line"><span>ส่วนลดเพิ่มเติม</span><span>−{otherDiscount} ฿</span></div>}
    <div className="receipt-total"><span>ยอดรวมสุทธิ<small>รวมค่าท็อปปิ้งแล้ว</small></span><strong>{total}<small>บาท</small></strong></div>
  </div>;
}
