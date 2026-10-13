import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw, Eraser, Coffee, Bell, Utensils, ShoppingBag, CheckCircle2, Play, BellRing } from "lucide-react";
import { useTodayOrders, updateOrderStatus, resetDay, clearCompletedOrders } from "../../hooks/useAdminOrders";
import type { Order } from "../../types";
import {
  ActionButton, CARD, ConfirmDialog, Header, ICON, LiveBadge, STATUS, StatusBadge, SystemStatus, useToast, type Status,
} from "./ui";

const formatClock = (ms: number) =>
  new Date(ms).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

const placeOf = (o: Order) =>
  o.orderType === "dine-in" ? (o.tableNumber ? `Table ${o.tableNumber}` : "Dine-in") : "Takeaway";

/** One row action per status → keeps the flow NEW → PREPARING → READY → COMPLETED */
const ROW_ACTION: Partial<Record<Status, { label: string; to: Status; variant: "secondary" | "primary" | "success"; icon: typeof Play }>> = {
  pending: { label: "Start", to: "making", variant: "secondary", icon: Play },
  making: { label: "Ready", to: "ready", variant: "primary", icon: BellRing },
  ready: { label: "Completed", to: "completed", variant: "success", icon: CheckCircle2 },
};

export function QueueManagement() {
  const orders = useTodayOrders();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const { show, toastHost } = useToast();

  const pending = orders.filter((o) => o.status === "pending" || o.status === "making");
  const ready = orders.filter((o) => o.status === "ready");
  const completed = orders.filter((o) => o.status === "completed");
  const currentlyServing = ready[0] ?? null;
  const nextInQueue = pending[0] ?? null;

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) => String(o.queueNumber).includes(s) || o.customerName.toLowerCase().includes(s));
  }, [orders, search]);

  const changeStatus = async (o: Order, to: Status) => {
    setBusyId(o.id);
    try {
      await updateOrderStatus(o.id, to);
      const msg = to === "completed" ? `คิว #${o.queueNumber} ส่งมอบเรียบร้อย` : `คิว #${o.queueNumber} → ${STATUS[to].label}`;
      show(msg);
    } catch (e) {
      console.error(e);
      show("อัปเดตไม่สำเร็จ ลองใหม่อีกครั้ง", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleResetQueue = async () => {
    setBusy(true);
    try {
      const count = await resetDay();
      show(`เคลียร์คิวแล้ว ${count} ออเดอร์ พร้อมเริ่มวันใหม่ที่คิว #1`);
      setConfirmReset(false);
    } catch (e) {
      console.error(e);
      show("รีเซ็ตคิวไม่สำเร็จ ลองใหม่อีกครั้ง", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleClearCompleted = async () => {
    setBusy(true);
    try {
      const count = await clearCompletedOrders();
      show(`ย้ายออเดอร์ที่ส่งมอบแล้ว ${count} รายการเข้าประวัติเรียบร้อย`);
    } catch (e) {
      console.error(e);
      show("เคลียร์ไม่สำเร็จ ลองใหม่อีกครั้ง", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] font-sans flex flex-col">
      <Header
        section="Queue"
        showDate
        chips={
          <>
            <LiveBadge />
            <span className="text-xs text-neutral-600 font-medium">{orders.length} Orders Today</span>
          </>
        }
      />

      <main className="flex-1 px-4 md:px-8 py-8 max-w-[1600px] w-full mx-auto">
        {/* Currently serving / next up */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <section className={`${CARD.base} ${CARD.success} p-8`}>
            <h2 className="text-xs font-bold tracking-wider text-emerald-50 mb-2">Currently Serving · รอส่งมอบ</h2>
            {currentlyServing ? (
              <div className="flex flex-wrap items-end justify-between gap-6 mt-4">
                <div>
                  <p className="text-7xl font-extrabold tracking-tighter">#{String(currentlyServing.queueNumber).padStart(3, "0")}</p>
                  <p className="mt-4 text-xl font-bold">K. {currentlyServing.customerName}</p>
                  <p className="text-sm text-emerald-50 mt-1 flex items-center gap-1.5">
                    <Bell size={ICON.sm} /> {placeOf(currentlyServing)}
                    {ready.length > 1 && ` · อีก ${ready.length - 1} คิวรอรับ`}
                  </p>
                </div>
                <ActionButton
                  variant="onColor"
                  icon={CheckCircle2}
                  loading={busyId === currentlyServing.id}
                  onClick={() => changeStatus(currentlyServing, "completed")}
                >
                  Completed
                </ActionButton>
              </div>
            ) : (
              <p className="text-lg text-emerald-50 py-12 text-center font-medium">ยังไม่มีออเดอร์พร้อมเสิร์ฟ</p>
            )}
          </section>

          <section className={`${CARD.base} ${CARD.white} p-8 flex flex-col justify-center`}>
            <h2 className="text-xs font-bold tracking-wider text-violet-700 mb-2">Next in Queue</h2>
            {nextInQueue ? (
              <div className="flex flex-wrap items-end justify-between gap-6 mt-2">
                <div>
                  <p className="text-6xl font-extrabold text-neutral-900 tracking-tighter">#{String(nextInQueue.queueNumber).padStart(3, "0")}</p>
                  <p className="mt-4 text-lg font-bold text-neutral-800">K. {nextInQueue.customerName}</p>
                  <p className="text-sm text-neutral-600 mt-0.5">{placeOf(nextInQueue)}</p>
                </div>
                {nextInQueue.status === "pending" ? (
                  <ActionButton icon={Coffee} loading={busyId === nextInQueue.id} onClick={() => changeStatus(nextInQueue, "making")}>
                    Call Next
                  </ActionButton>
                ) : (
                  <StatusBadge status={nextInQueue.status} />
                )}
              </div>
            ) : (
              <p className="text-lg text-neutral-500 py-12 text-center font-medium">ไม่มีคิวถัดไป</p>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[2.5fr_1fr] gap-6">
          {/* Queue timeline */}
          <section className={`${CARD.base} ${CARD.white} p-6 md:p-8`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-neutral-900">Queue Timeline</h2>
              <div className="relative w-full sm:w-auto">
                <Search size={ICON.md} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="ค้นหาคิวหรือชื่อลูกค้า"
                  placeholder="Search Queue # or Name"
                  className="w-full sm:w-64 min-h-11 pl-11 pr-4 text-sm rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-neutral-500"
                />
              </div>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-[11px] font-bold text-neutral-500 tracking-wider border-b border-neutral-100 mb-2" aria-hidden>
              <div className="col-span-2">Queue #</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Time Ordered</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            <div className="flex flex-col max-h-[55vh] min-h-[200px] overflow-y-auto pr-2">
              {filtered.length === 0 && <p className="text-center text-sm text-neutral-500 py-12">ไม่พบออเดอร์</p>}
              <AnimatePresence initial={false}>
                {filtered.map((o) => {
                  const act = ROW_ACTION[o.status];
                  return (
                    <motion.div
                      key={o.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center py-4 px-4 border-b border-neutral-50 rounded-xl ${
                        o.status === "ready" ? "bg-emerald-50/50" : o.status === "completed" ? "bg-neutral-50/70" : "hover:bg-neutral-50/50"
                      }`}
                    >
                      <div className="md:col-span-2">
                        <span className={`text-xl font-bold tracking-tight ${STATUS[o.status].number}`}>
                          #{String(o.queueNumber).padStart(3, "0")}
                        </span>
                      </div>

                      <div className="md:col-span-3 flex flex-col">
                        <span className="font-bold text-neutral-800 text-sm">K. {o.customerName}</span>
                        <span className="text-xs text-neutral-600 mt-1 flex items-center gap-1.5">
                          {o.orderType === "dine-in" ? <Utensils size={12} /> : <ShoppingBag size={12} />}
                          {o.items?.length || 1} Items · {placeOf(o)}
                        </span>
                      </div>

                      <div className="md:col-span-2">
                        <StatusBadge status={o.status} />
                      </div>

                      <div className="md:col-span-2 text-sm text-neutral-600 font-medium">{formatClock(o.createdAt)}</div>

                      <div className="md:col-span-3 flex md:justify-end">
                        {act ? (
                          <ActionButton
                            size="sm"
                            variant={act.variant}
                            icon={act.icon}
                            loading={busyId === o.id}
                            onClick={() => changeStatus(o, act.to)}
                            aria-label={`${act.label} คิว ${o.queueNumber}`}
                          >
                            {act.label}
                          </ActionButton>
                        ) : (
                          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
                            {o.status === "completed" && <CheckCircle2 size={ICON.sm} />}
                            {o.status === "completed" ? "ส่งมอบแล้ว" : "—"}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>

          {/* Summary + actions */}
          <div className="flex flex-col gap-6">
            <section className={`${CARD.base} ${CARD.white} p-8`}>
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Queue Summary</h2>
              <dl className="grid grid-cols-3 gap-3 text-center">
                {[
                  { k: "In Queue", n: pending.length, box: "bg-sky-50", c: "text-sky-700" },
                  { k: "Ready", n: ready.length, box: "bg-emerald-50", c: "text-emerald-700" },
                  { k: "Completed", n: completed.length, box: "bg-neutral-100", c: "text-neutral-600" },
                ].map((s) => (
                  <div key={s.k} className={`rounded-2xl py-5 px-1 ${s.box}`}>
                    <dt className={`text-[11px] font-bold tracking-wide mb-2 ${s.c}`}>{s.k}</dt>
                    <dd className={`text-4xl font-extrabold ${s.c}`}>{s.n}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <div className="flex flex-col gap-3">
              <ActionButton variant="dark" icon={RotateCcw} disabled={busy} onClick={() => setConfirmReset(true)}>
                Reset Queue
              </ActionButton>
              <ActionButton variant="secondary" icon={Eraser} disabled={busy || completed.length === 0} onClick={handleClearCompleted}>
                Clear Completed
              </ActionButton>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-4 md:px-8 py-5 flex items-center gap-6 text-xs text-neutral-500 border-t border-neutral-200 bg-white">
        <SystemStatus label="System Active" />
      </footer>

      <ConfirmDialog
        open={confirmReset}
        busy={busy}
        title="จบวันนี้และเคลียร์คิวทั้งหมด?"
        message={`ออเดอร์ ${orders.length} รายการจะถูกย้ายไปเก็บใน orderHistory ก่อน (ไม่ได้ลบทิ้ง) และคิวจะเริ่มใหม่ที่ #1`}
        confirmLabel="Reset Queue"
        onConfirm={handleResetQueue}
        onCancel={() => setConfirmReset(false)}
      />
      {toastHost}
    </div>
  );
}