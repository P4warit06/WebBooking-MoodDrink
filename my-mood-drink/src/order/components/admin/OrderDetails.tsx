import type { Mood, Order } from "../../types";
import { OrderItems } from "../shared/OrderItems";
import { formatRequestedTime } from "../../utils/fulfillment";

export function OrderDetails({ order, moods }: { order: Order; moods: Mood[] }) {
  return <div className="space-y-3">
    {order.items?.length ? <OrderItems items={order.items} moods={moods} /> : <p className="text-sm text-slate-500">ไม่มีรายละเอียดเครื่องดื่มในออเดอร์นี้</p>}
    <div className="order-fulfillment-summary"><p><strong>เวลาที่ต้องการ:</strong> {formatRequestedTime(order.requestedAt)}</p><p><strong>วิธีรับ:</strong> {order.fulfillmentMethod === "delivery" ? "ให้เดินไปส่ง" : "รับหน้าร้าน"}</p>{order.fulfillmentMethod === "delivery" && <p><strong>สถานที่ส่ง:</strong> {order.deliveryLocation || "ไม่ได้ระบุ"}</p>}</div>
    <div className="flex justify-between text-sm font-semibold text-slate-700 pt-1"><span>ยอดรวมสุทธิ</span><span>{order.totalPrice ?? "—"} ฿</span></div>
  </div>;
}
