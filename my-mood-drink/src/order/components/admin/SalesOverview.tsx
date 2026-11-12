import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, type Timestamp } from "firebase/firestore";
import { Banknote, CupSoda, Sparkles, ReceiptText, LoaderCircle } from "lucide-react";
import { db } from "../../../services/firebase";
import { useTodayOrders } from "../../hooks/useAdminOrders";
import type { Order } from "../../types";

type Slip = { orderId: string; imageData: string; submittedAt: number };
const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const dateKey = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
const drinkName = (item: Order["items"][number]) => item.drinkname || item.drinkName || "ไม่ระบุเมนู";

export function SalesOverview() {
  const { orders, loading, error } = useTodayOrders();
  const [slips, setSlips] = useState<Slip[]>([]);
  const [slipsLoading, setSlipsLoading] = useState(true);
  useEffect(() => onSnapshot(query(collection(db, "paymentSlips"), orderBy("submittedAt", "desc")), snap => {
    setSlips(snap.docs.map(docSnap => {
      const data = docSnap.data();
      return { orderId: docSnap.id, imageData: String(data.imageData || ""), submittedAt: (data.submittedAt as Timestamp | undefined)?.toMillis?.() ?? 0 };
    }));
    setSlipsLoading(false);
  }, cause => { console.error("Could not load slips:", cause); setSlipsLoading(false); }), []);

  const todaysOrders = useMemo(() => orders.filter(order => dateKey(order.createdAt) === todayKey()), [orders]);
  const paidOrders = todaysOrders.filter(order => order.paymentStatus === "verified" && order.status !== "cancelled");
  const revenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const glasses = paidOrders.reduce((sum, order) => sum + order.items.length, 0);
  const drinks = new Map<string, number>();
  const toppings = new Map<string, number>();
  paidOrders.forEach(order => order.items.forEach(item => {
    const name = drinkName(item);
    drinks.set(name, (drinks.get(name) || 0) + 1);
    item.addons.forEach(addon => toppings.set(addon.name, (toppings.get(addon.name) || 0) + 1));
  }));
  const bestDrink = [...drinks].sort((a, b) => b[1] - a[1])[0];
  const bestTopping = [...toppings].sort((a, b) => b[1] - a[1])[0];
  const todaySlips = slips.filter(slip => slip.submittedAt && dateKey(slip.submittedAt) === todayKey() && todaysOrders.some(order => order.id === slip.orderId));
  const cards = [
    { label: "ยอดขายที่ยืนยันแล้ว", value: `${revenue.toLocaleString("th-TH")} ฿`, icon: Banknote, color: "text-emerald-700" },
    { label: "จำนวนแก้วที่ขาย", value: `${glasses} แก้ว`, icon: CupSoda, color: "text-sky-700" },
    { label: "เมนูขายดีที่สุด", value: bestDrink ? `${bestDrink[0]} · ${bestDrink[1]} แก้ว` : "ยังไม่มีข้อมูล", icon: Sparkles, color: "text-violet-700" },
    { label: "ท็อปปิ้งยอดนิยม", value: bestTopping ? `${bestTopping[0]} · ${bestTopping[1]} แก้ว` : "ยังไม่มีข้อมูล", icon: ReceiptText, color: "text-rose-700" },
  ];

  return <main className="min-h-screen px-4 py-7 sm:px-8 bg-[radial-gradient(ellipse_at_top_left,#fce7f3,transparent_45%),radial-gradient(ellipse_at_top_right,#dbeafe,transparent_45%),#f5f7fb] text-slate-800">
    <header className="admin-page-heading"><span className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">Mood Drink · Today</span><h1 className="mt-2 text-2xl sm:text-3xl font-extrabold">ภาพรวมยอดขายวันนี้</h1><p className="mt-1 text-sm text-slate-500">สรุปจากออเดอร์ที่พนักงานยืนยันการชำระเงินแล้ว</p></header>
    {error && <p role="alert" className="mb-4 rounded-2xl bg-rose-100/70 p-4 text-rose-800">{error}</p>}
    {loading ? <p className="flex items-center gap-2 text-slate-500"><LoaderCircle className="animate-spin" /> กำลังโหลดสรุป...</p> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({label, value, icon: Icon, color}) => <article key={label} className="rounded-[1.7rem] border border-white/70 bg-white/55 p-5 shadow-[0_12px_35px_rgba(57,65,105,.12)] backdrop-blur-xl"><div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/80 shadow-inner ${color}`}><Icon size={21}/></div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-extrabold">{value}</p></article>)}
      </section>
      <section className="mt-7 rounded-[1.8rem] border border-white/80 bg-white/55 p-5 shadow-[0_12px_35px_rgba(57,65,105,.12)] backdrop-blur-xl sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">สลิปการชำระเงินวันนี้</h2><p className="mt-1 text-sm text-slate-500">สลิปของออเดอร์วันนี้ทั้งหมด รวมที่ผ่านและรอตรวจสอบ</p></div><span className="rounded-full bg-violet-100/80 px-3 py-1 text-sm font-bold text-violet-700">{todaySlips.length} รายการ</span></div>
        {slipsLoading ? <p className="mt-6 flex items-center gap-2 text-slate-500"><LoaderCircle className="animate-spin"/> กำลังโหลดสลิป...</p> : todaySlips.length === 0 ? <p className="py-10 text-center text-slate-500">วันนี้ยังไม่มีสลิปที่ส่งเข้าระบบ</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{todaySlips.map(slip => {
          const order = todaysOrders.find(item => item.id === slip.orderId);
          return <article key={slip.orderId} className="overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-md backdrop-blur-lg"><img src={slip.imageData} alt={`สลิปคิว ${order?.queueNumber ?? ""}`} className="h-56 w-full object-contain bg-slate-100/80"/><div className="p-4"><div className="flex justify-between gap-2"><strong>คิว #{String(order?.queueNumber ?? "—").padStart(2,"0")}</strong><strong>{order?.totalPrice ?? 0} ฿</strong></div><p className="mt-1 text-sm text-slate-500">{order?.customerName || "ลูกค้า"}</p><p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${order?.paymentStatus === "verified" ? "bg-emerald-100 text-emerald-800" : order?.paymentStatus === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{order?.paymentStatus === "verified" ? "ตรวจแล้ว" : order?.paymentStatus === "rejected" ? "ไม่ผ่าน" : "รอตรวจ"}</p></div></article>;
        })}</div>}
      </section>
    </>}
  </main>;
}
