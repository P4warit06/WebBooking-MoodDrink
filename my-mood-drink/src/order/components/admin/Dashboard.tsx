import { useState } from "react";
import { Coffee, CheckCircle2, LoaderCircle } from "lucide-react";
import { useTodayOrders, updateOrderStatus } from "../../hooks/useAdminOrders";
import { useMoods } from "../../hooks/useMood";
import { OrderDetails } from "./OrderDetails";
import { LiveClock } from "./LiveClock";

export function Dashboard() {
  const { orders, loading, error } = useTodayOrders();
  const { moods } = useMoods(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const active = orders.filter(o => o.status === "pending" || o.status === "making" || o.status === "ready");
  const update = async (id: string) => {
    setBusyId(id);
    try { await updateOrderStatus(id, "ready"); }
    catch (e) { console.error(e); alert("อัปเดตสถานะไม่สำเร็จ กรุณาลองอีกครั้ง"); }
    finally { setBusyId(null); }
  };
  return <main className="min-h-screen bg-[#f7f8fc] text-slate-800">
    <header className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 px-5 sm:px-8 py-6 flex flex-wrap justify-between gap-4 items-center">
      <div className="flex items-center gap-3"><span className="bg-white p-3 rounded-2xl text-violet-600"><Coffee /></span><div><h1 className="text-xl sm:text-2xl font-bold">Mood Drink <span className="font-normal">Barista</span></h1><p className="text-xs text-violet-700 mt-1">● รายการอัปเดตอัตโนมัติ · {active.length} คิวที่กำลังดำเนินการ</p></div></div><LiveClock />
    </header>
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-7">
      <div className="grid grid-cols-3 gap-3 mb-8">{[["รอจัดเตรียม", "pending", "bg-violet-100 text-violet-800"], ["กำลังทำ", "making", "bg-amber-100 text-amber-800"], ["พร้อมเสิร์ฟ", "ready", "bg-emerald-100 text-emerald-800"]].map(([label,status,color]) => <div key={status} className={`rounded-2xl p-4 ${color}`}><p className="text-xs sm:text-sm font-semibold">{label}</p><p className="text-2xl font-bold mt-1">{orders.filter(o => o.status === status).length}</p></div>)}</div>
      <h2 className="text-lg font-bold mb-4">รายการเครื่องดื่ม</h2>
      {loading && <p className="flex gap-2 items-center text-slate-500 py-8" role="status"><LoaderCircle className="animate-spin" size={20} /> กำลังโหลดออเดอร์...</p>}
      {error && <p role="alert" className="rounded-2xl bg-red-50 text-red-700 p-4">{error}</p>}
      {!loading && !error && active.length === 0 && <p className="bg-white rounded-2xl p-8 text-center text-slate-500">ยังไม่มีออเดอร์ที่กำลังดำเนินการ</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{active.map(order => {
        const status = order.status === "ready" ? ["พร้อมเสิร์ฟ", "bg-emerald-100 text-emerald-800", "border-emerald-200"] : order.status === "making" ? ["กำลังทำ", "bg-amber-100 text-amber-800", "border-amber-200"] : ["รอจัดเตรียม", "bg-violet-100 text-violet-800", "border-violet-200"];
        return <article key={order.id} className={`bg-white rounded-[28px] border ${status[2]} shadow-sm p-5 flex flex-col gap-4`} aria-busy={busyId === order.id}>
          <div className="flex justify-between items-start gap-2"><div><p className="text-3xl font-extrabold">#{String(order.queueNumber).padStart(2,"0")}</p><p className="text-sm font-semibold mt-1">{order.customerName || "ไม่ระบุชื่อ"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${status[1]}`}>{status[0]}</span></div>
          <OrderDetails order={order} moods={moods} />
          {order.status !== "ready" && <button disabled={busyId !== null} onClick={() => update(order.id)} className="mt-auto rounded-2xl bg-violet-600 hover:bg-violet-700 text-white py-3 flex items-center justify-center gap-2 font-semibold disabled:opacity-50">{busyId === order.id ? <><LoaderCircle size={18} className="animate-spin" /> กำลังอัปเดต...</> : <><CheckCircle2 size={18} /> พร้อมเสิร์ฟ</>}</button>}
        </article>;
      })}</div>
    </div>
  </main>;
}
