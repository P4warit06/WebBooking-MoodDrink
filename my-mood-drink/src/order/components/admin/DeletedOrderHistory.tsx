import { useMemo, useState } from "react";
import { ImageOff, LoaderCircle, Search, Trash2 } from "lucide-react";
import { useDeletedOrderHistory } from "../../hooks/useAdminOrders";
import { useMoods } from "../../hooks/useMood";
import { OrderDetails } from "./OrderDetails";

function formatDate(value: number) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function DeletedOrderHistory() {
  const { records, loading, error } = useDeletedOrderHistory();
  const { moods } = useMoods(true);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter(record => {
      const order = record.order;
      return record.originalOrderId.toLowerCase().includes(term)
        || String(order?.queueNumber ?? "").includes(term)
        || (order?.customerName ?? "").toLowerCase().includes(term);
    });
  }, [records, search]);

  return (
    <main className="min-h-screen px-4 py-7 text-slate-800 sm:px-8">
      <header className="admin-page-heading flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[.2em] text-rose-600">Mood Drink · Deleted Archive</span>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">ประวัติที่ถูกลบ</h1>
          <p className="mt-1 text-sm text-slate-500">รายการสลิปไม่ผ่านและสลิปที่ไม่พบข้อมูลออเดอร์ซึ่งถูกนำออกจากหน้าตรวจยอด</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 shadow-sm">
          <Trash2 size={18} className="text-rose-600" />
          <strong className="text-sm">{records.length} รายการ</strong>
        </div>
      </header>

      <label className="relative mb-5 block rounded-[1.5rem] border border-white/80 bg-white/55 p-4 shadow-[0_10px_30px_rgba(57,65,105,.1)] backdrop-blur-xl">
        <Search size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="ค้นหาเลขคิว ชื่อลูกค้า หรือรหัสออเดอร์"
          className="w-full rounded-xl border border-white/80 bg-white/75 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-rose-200"
        />
      </label>

      {error && <p role="alert" className="mb-4 rounded-2xl bg-rose-100/80 p-4 text-rose-800">{error}</p>}
      {loading ? (
        <p role="status" className="flex items-center gap-2 text-slate-500"><LoaderCircle className="animate-spin" /> กำลังโหลดประวัติที่ถูกลบ...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-[1.7rem] border border-white/80 bg-white/55 p-12 text-center text-slate-500 shadow-[0_10px_30px_rgba(57,65,105,.1)] backdrop-blur-xl">ยังไม่มีรายการในประวัติที่ถูกลบ</div>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {filtered.map(record => {
            const order = record.order;
            return (
              <article key={record.id} className="overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/55 shadow-[0_10px_30px_rgba(57,65,105,.1)] backdrop-blur-xl">
                {record.slipImageData ? (
                  <img src={record.slipImageData} alt={`สลิปที่ถูกลบ ${order?.queueNumber ?? record.originalOrderId}`} className="h-64 w-full bg-slate-100/70 object-contain" />
                ) : (
                  <div className="grid h-40 place-items-center bg-white/40 text-slate-400"><span className="flex items-center gap-2"><ImageOff size={20} /> ไม่มีภาพสลิป</span></div>
                )}
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl font-extrabold">{order ? `#${String(order.queueNumber).padStart(2, "0")}` : "ไม่พบเลขคิว"}</p>
                      <p className="font-semibold text-slate-700">{order?.customerName || "ไม่พบข้อมูลลูกค้า"}</p>
                      <p className="mt-1 text-xs text-slate-500">ลบเมื่อ {formatDate(record.deletedAt)}</p>
                    </div>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                      {record.deletionReason === "payment_rejected" ? "สลิปไม่ผ่าน" : "ไม่พบออเดอร์"}
                    </span>
                  </div>

                  {order ? (
                    <div className="mt-4 rounded-2xl bg-white/65 p-4"><OrderDetails order={order} moods={moods} /></div>
                  ) : (
                    <p className="mt-4 rounded-2xl bg-white/65 p-4 text-sm text-slate-600">รหัสเดิม {record.originalOrderId}</p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
