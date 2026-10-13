import { useState } from "react";
import { CheckCircle2, ChefHat, History as HistoryIcon, Plus, Settings, StickyNote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActiveOrders, useTodayOrders, updateOrderStatus } from "../../hooks/useAdminOrders";
import type { Order } from "../../types";
import {
  ActionButton, CARD, Header, ICON, IconButton, LiveBadge, Notification, QuickActionCard,
  STATUS, StatusBadge, SystemStatus, getNote, useTick, useToast,
} from "./ui";

const LATE_AFTER_MIN = 10;

const ageMinutes = (ms: number) => Math.max(0, Math.round((Date.now() - ms) / 60000));
const ageText = (m: number) => (m === 0 ? "Just now" : `${m} mins ago`);

function ProductItem({ order }: { order: Order }) {
  const hasAddons = !!order.addons?.length;
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-100 overflow-hidden">
        <img
          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(order.drinkName)}`}
          alt=""
          className="w-full h-full object-cover opacity-80"
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-neutral-800 truncate">{order.drinkName}</p>
        <p className="text-xs text-neutral-600">
          {hasAddons ? `+ ${order.addons!.map((a) => a.name).join(", ")}` : "No add-ons"}
        </p>
      </div>
    </div>
  );
}

function OrderCard({ order, busy, onAction }: { order: Order; busy: boolean; onAction: (o: Order) => void }) {
  const s = STATUS[order.status];
  const mins = ageMinutes(order.createdAt);
  const late = (order.status === "pending" || order.status === "making") && mins >= LATE_AFTER_MIN;
  const note = getNote(order);
  const place =
    order.orderType === "dine-in" ? (order.tableNumber ? `Table ${order.tableNumber}` : "Dine-in") : "Takeaway";

  const action =
    order.status === "ready"
      ? { label: "ส่งมอบแล้ว (Completed)", variant: "success" as const }
      : order.status === "pending" || order.status === "making"
        ? { label: "พร้อมเสิร์ฟ (Ready to Serve)", variant: "primary" as const }
        : null;

  return (
    <article className={`${CARD.base} p-6 flex flex-col gap-3 ${s.card}`} aria-label={`คิว ${order.queueNumber} ${s.label}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`text-5xl font-extrabold tracking-tighter ${s.number}`}>
          #{String(order.queueNumber).padStart(2, "0")}
        </span>
        <StatusBadge status={order.status} />
      </div>

      <div>
        <p className="text-lg font-bold text-neutral-900">K. {order.customerName}</p>
        <p className="text-xs font-medium mt-0.5 text-neutral-600">
          {place} ·{" "}
          <span className={late ? "text-red-600 font-bold" : ""}>
            {ageText(mins)}
            {late && " (ช้า)"}
          </span>
        </p>
      </div>

      <div className="mt-2 border-t border-neutral-100 pt-4 flex flex-col gap-3">
        <ProductItem order={order} />
        {note && (
          <p className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50 rounded-xl px-3 py-2">
            <StickyNote size={ICON.sm} className="mt-0.5 shrink-0" /> {note}
          </p>
        )}
      </div>

      {action && (
        <ActionButton variant={action.variant} icon={CheckCircle2} block loading={busy} onClick={() => onAction(order)} className="mt-3">
          {action.label}
        </ActionButton>
      )}
    </article>
  );
}

function AnalyticsCard({ avgPrepMinutes, total }: { avgPrepMinutes: number | null; total: number }) {
  return (
    <section className={`${CARD.base} ${CARD.brand} p-6 flex flex-col justify-between min-h-[280px]`}>
      <h2 className="text-lg font-bold">Barista Efficiency</h2>
      <div className="h-24 w-full mt-2 mb-6" aria-hidden>
        <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,40 L0,30 L20,25 L40,10 L60,20 L80,15 L100,18 L100,40 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M0,30 L20,25 L40,10 L60,20 L80,15 L100,18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <dl className="flex flex-col gap-3 mt-auto text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-violet-100">Avg. Prep Time</dt>
          <dd className="font-bold">{avgPrepMinutes !== null ? `${avgPrepMinutes} min` : "—"}</dd>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <dt className="text-violet-100">Today's Total</dt>
          <dd className="font-bold">{total} Orders</dd>
        </div>
      </dl>
    </section>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { orders, loading } = useActiveOrders();
  const todayOrders = useTodayOrders();
  const { show, toastHost } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  useTick(30000); // refresh "x mins ago"

  const handleAction = async (order: Order) => {
    const next = order.status === "ready" ? "completed" : "ready";
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, next);
      show(next === "ready" ? `คิว #${order.queueNumber} พร้อมเสิร์ฟแล้ว` : `คิว #${order.queueNumber} ส่งมอบเรียบร้อย`);
    } catch (e) {
      console.error("Failed to update order:", e);
      show("อัปเดตสถานะไม่สำเร็จ ลองใหม่อีกครั้ง", "error");
    } finally {
      setBusyId(null);
    }
  };

  // Only orders that reached ready/completed have a meaningful prep duration
  const finished = todayOrders.filter((o) => o.status === "ready" || o.status === "completed");
  const avgPrepMinutes =
    finished.length > 0
      ? Math.round(finished.reduce((sum, o) => sum + (o.updatedAt - o.createdAt), 0) / finished.length / 60000)
      : null;

  const readyCount = orders.filter((o) => o.status === "ready").length;

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] font-sans flex flex-col">
      <Header
        section="Barista"
        chips={
          <>
            <LiveBadge />
            <span className="text-xs text-neutral-600 font-medium">{orders.length} Orders in Queue</span>
          </>
        }
        actions={
          <>
            <IconButton label="ตั้งค่า" icon={Settings} />
            <Notification count={readyCount} />
          </>
        }
      />

      <main className="flex-1 px-4 md:px-8 py-8 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && <p className="col-span-full text-center text-sm text-neutral-500 py-10">กำลังโหลดออเดอร์...</p>}
          {!loading && orders.length === 0 && (
            <p className="col-span-full text-center text-sm text-neutral-500 py-10 flex flex-col items-center gap-2">
              <ChefHat size={ICON.xl} className="text-neutral-300" /> ยังไม่มีออเดอร์เข้าคิวตอนนี้
            </p>
          )}

          {orders.map((order) => (
            <OrderCard key={order.id} order={order} busy={busyId === order.id} onAction={handleAction} />
          ))}

          <AnalyticsCard avgPrepMinutes={avgPrepMinutes} total={todayOrders.length} />
          <QuickActionCard icon={Plus} label="Manual Add" onClick={() => show("ยังไม่เปิดให้ใช้งานเพิ่มออเดอร์เอง", "error")} />
          <QuickActionCard icon={HistoryIcon} label="View History" onClick={() => navigate("/admin/queue")} />
        </div>
      </main>

      <footer className="px-4 md:px-8 py-5 flex flex-wrap gap-3 items-center justify-between text-xs text-neutral-500 border-t border-neutral-200 bg-white">
        <div className="flex items-center gap-6">
          <SystemStatus label="POS Connected" />
          <SystemStatus label="Printer Online" />
        </div>
        <div className="flex items-center gap-4">
          <span>V2.4.1 Build 290</span>
          <span className="text-neutral-300">|</span>
          <span>Mood Drink Co., Ltd.</span>
        </div>
      </footer>
      {toastHost}
    </div>
  );
}