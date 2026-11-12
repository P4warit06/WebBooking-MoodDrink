import { useMemo, useState } from "react";
import { Archive, LoaderCircle, Search } from "lucide-react";
import { useMoods } from "../../hooks/useMood";
import { useOrderHistory, useTodayOrders } from "../../hooks/useAdminOrders";
import { OrderDetails } from "./OrderDetails";

const statusLabel: Record<string, string> = {
  completed: "รับแล้ว",
  cancelled: "ยกเลิก",
  pending: "รอจัดเตรียม",
  making: "กำลังทำ",
  ready: "พร้อมเสิร์ฟ",
};

const statusStyle: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  pending: "bg-violet-100 text-violet-800",
  making: "bg-amber-100 text-amber-800",
  ready: "bg-sky-100 text-sky-800",
};

function formatDate(ms: number) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(ms));
}

export function OrderHistory() {
  const { orders: archived, loading: historyLoading, error: historyError } = useOrderHistory();
  const { orders: current, loading: currentLoading } = useTodayOrders();
  const { moods } = useMoods(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "completed" | "cancelled">("all");

  const orders = useMemo(() => {
    const merged = new Map(archived.map((order) => [order.id, order]));
    current.filter((order) => order.status === "completed" || order.status === "cancelled").forEach((order) => {
      if (!merged.has(order.id)) merged.set(order.id, { ...order, archivedAt: order.updatedAt });
    });
    return [...merged.values()].sort((a, b) => b.archivedAt - a.archivedAt);
  }, [archived, current]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesSearch = !term || String(order.queueNumber).includes(term) || order.customerName.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, status]);

  const loading = historyLoading || currentLoading;
  return <main className="min-h-screen px-4 py-7 sm:px-8 bg-[radial-gradient(ellipse_at_top_left,#ede9fe,transparent_42%),radial-gradient(ellipse_at_top_right,#dbeafe,transparent_42%),#f8fafc] text-slate-800">
    <header className="admin-page-heading flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><span className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">Mood Drink · Archive</span><h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">ประวัติออเดอร์ทั้งหมด</h1><p className="mt-1 text-sm text-slate-500">รวมออเดอร์ที่รับแล้วและออเดอร์ที่ถูกย้ายตอนจบวัน</p></div>
      <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/55 px-4 py-3 shadow-[0_10px_30px_rgba(57,65,105,.1)] backdrop-blur-xl"><Archive size={18} className="text-violet-600"/><span className="text-sm font-bold">{orders.length} ออเดอร์</span></div>
    </header>
    <div className="mb-5 grid gap-3 rounded-[1.5rem] border border-white/80 bg-white/55 p-4 shadow-[0_10px_30px_rgba(57,65,105,.1)] backdrop-blur-xl sm:grid-cols-[1fr_auto]">
      <label className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเลขคิวหรือชื่อลูกค้า" className="w-full rounded-xl border border-white/80 bg-white/75 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-violet-200"/></label>
      <div className="flex gap-2"><button type="button" onClick={() => setStatus("all")} className={`rounded-xl px-4 py-2 text-sm font-bold ${status === "all" ? "bg-slate-800 text-white" : "bg-white/75 text-slate-500"}`}>ทั้งหมด</button><button type="button" onClick={() => setStatus("completed")} className={`rounded-xl px-4 py-2 text-sm font-bold ${status === "completed" ? "bg-emerald-600 text-white" : "bg-white/75 text-slate-500"}`}>รับแล้ว</button><button type="button" onClick={() => setStatus("cancelled")} className={`rounded-xl px-4 py-2 text-sm font-bold ${status === "cancelled" ? "bg-rose-600 text-white" : "bg-white/75 text-slate-500"}`}>ยกเลิก</button></div>
    </div>
    {historyError && <p role="alert" className="mb-4 rounded-2xl bg-rose-100/80 p-4 text-rose-800">{historyError}</p>}
    {loading ? <p role="status" className="flex items-center gap-2 text-slate-500"><LoaderCircle className="animate-spin"/> กำลังโหลดประวัติ...</p> : filtered.length === 0 ? <div className="rounded-[1.7rem] border border-white/80 bg-white/55 p-12 text-center text-slate-500 shadow-[0_10px_30px_rgba(57,65,105,.1)] backdrop-blur-xl">ยังไม่มีออเดอร์ในหมวดนี้</div> : <section className="grid gap-4 lg:grid-cols-2">{filtered.map((order) => <article key={order.id} className="rounded-[1.7rem] border border-white/80 bg-white/55 p-5 shadow-[0_10px_30px_rgba(57,65,105,.1)] backdrop-blur-xl"><div className="flex items-start justify-between gap-3"><div><p className="text-2xl font-extrabold">#{String(order.queueNumber).padStart(2, "0")}</p><p className="font-semibold text-slate-700">{order.customerName}</p><p className="mt-1 text-xs text-slate-500">เก็บเข้าประวัติ {formatDate(order.archivedAt)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[order.status] || "bg-slate-100 text-slate-700"}`}>{statusLabel[order.status] || order.status}</span></div><div className="mt-4 rounded-2xl bg-white/65 p-4"><OrderDetails order={order} moods={moods}/></div></article>)}</section>}
  </main>;
}
