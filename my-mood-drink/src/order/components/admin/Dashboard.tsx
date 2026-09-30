import { useEffect, useState } from "react";
import { Coffee, Bell, Settings, History as HistoryIcon, CheckCircle2, Plus } from "lucide-react";
import { useActiveOrders, useTodayOrders, updateOrderStatus } from "../../hooks/useAdminOrders";
import type { Order } from "../../types";
import { LiveClock } from "./LiveClock";

function minutesAgo(ms: number) {
  const mins = Math.max(0, Math.round((Date.now() - ms) / 60000));
  return mins === 0 ? "Just now" : `${mins} mins ago`;
}

function OrderCard({ order, onMarkReady }: { order: Order; onMarkReady: (id: string) => void }) {
  const isPreparing = order.status === "pending" || order.status === "making";
  
  // Determine card styling based on status to match the image
  let cardStyle = "bg-white border-neutral-100";
  let numberColor = "text-violet-600";
  let badgeStyle = "bg-violet-100 text-violet-700";
  let badgeText = "NEW";

  if (order.status === "making") {
    cardStyle = "bg-pink-50/50 border-pink-100";
    numberColor = "text-pink-500";
    badgeStyle = "bg-pink-100 text-pink-600";
    badgeText = "PREPARING";
  } else if (order.status === "ready") {
    cardStyle = "bg-emerald-50/50 border-emerald-200";
    numberColor = "text-emerald-600";
    badgeStyle = "bg-emerald-500 text-white";
    badgeText = "READY";
  }

  return (
    <div className={`rounded-[2rem] border p-6 shadow-sm flex flex-col gap-3 ${cardStyle}`}>
      <div className="flex items-start justify-between">
        <span className={`text-5xl font-extrabold tracking-tighter ${numberColor}`}>
          #{String(order.queueNumber).padStart(2, "0")}
        </span>
        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider ${badgeStyle}`}>
          {badgeText}
        </span>
      </div>
      
      <div className="mt-1">
        <p className="text-lg font-bold text-neutral-900">K. {order.customerName}</p>
        <p className="text-xs text-neutral-500 font-medium mt-0.5">
          {order.orderType === 'dine-in' ? `Table ${order.tableNumber || '12'}` : 'Takeaway'} · {minutesAgo(order.createdAt)}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-neutral-100 pt-4">
        {/* Mocking the drink items with images as per the design */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center overflow-hidden">
             {/* Placeholder for drink image */}
             <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${order.drinkName}`} alt="drink" className="w-full h-full object-cover opacity-80" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-800">{order.drinkName}</p>
            {order.addons && order.addons.length > 0 && (
              <p className="text-xs text-neutral-500">+ {order.addons.map((a) => a.name).join(", ")}</p>
            )}
            {(!order.addons || order.addons.length === 0) && (
               <p className="text-xs text-neutral-400">No add-ons</p>
            )}
          </div>
        </div>
      </div>

      {isPreparing && (
        <button
          onClick={() => onMarkReady(order.id)}
          className="mt-4 w-full py-3.5 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-violet-500/20"
        >
          <CheckCircle2 size={18} /> พร้อมเสิร์ฟ (Ready to Serve)
        </button>
      )}
    </div>
  );
}

export function Dashboard() {
  const { orders, loading } = useActiveOrders();
  const todayOrders = useTodayOrders();

  const handleMarkReady = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "ready");
    } catch (e) {
      console.error("Failed to mark order ready:", e);
      alert("อัปเดตสถานะไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  };

  // Avg prep time (logic เดิม)
  const finishedToday = todayOrders.filter((o) => o.status !== "pending");
  const avgPrepMinutes =
    finishedToday.length > 0
      ? Math.round(
          finishedToday.reduce((sum, o) => sum + (o.updatedAt - o.createdAt), 0) /
            finishedToday.length /
            60000
        )
      : null;

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <Coffee size={24} className="text-violet-600" />
          </span>
          <div>
            <p className="text-2xl font-bold text-neutral-900 tracking-tight">Mood Drink <span className="font-normal text-neutral-600">Barista</span></p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Live Updates
              </span>
              <span className="text-xs text-neutral-500 font-medium">{orders.length} Orders in Queue</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-0.5">Current Time</p>
            {/* Using LiveClock but styling it to match */}
            <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              <LiveClock />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-600 shadow-sm hover:bg-neutral-50 transition">
              <Settings size={20} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-600 shadow-sm hover:bg-neutral-50 transition">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 py-8 max-w-[1600px] mx-auto">
        {/* Order grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && (
            <p className="col-span-full text-center text-sm text-neutral-400 py-10">
              กำลังโหลดออเดอร์...
            </p>
          )}
          {!loading && orders.length === 0 && (
            <p className="col-span-full text-center text-sm text-neutral-400 py-10">
              ยังไม่มีออเดอร์เข้าคิวตอนนี้
            </p>
          )}
          
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onMarkReady={handleMarkReady} />
          ))}

          {/* Stats Card - Barista Efficiency */}
          <div className="rounded-[2rem] bg-[#7c3aed] text-white p-6 flex flex-col justify-between shadow-lg shadow-violet-500/20 min-h-[280px]">
            <p className="text-lg font-bold text-white mb-2">Barista Efficiency</p>
            
            {/* Mock Chart Area */}
            <div className="h-24 w-full relative mt-2 mb-6">
               <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                  <path d="M0,40 L0,30 L20,25 L40,10 L60,20 L80,15 L100,18 L100,40 Z" fill="rgba(255,255,255,0.1)" />
                  <path d="M0,30 L20,25 L40,10 L60,20 L80,15 L100,18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="text-violet-200">Avg. Prep Time</span>
                <span className="font-bold">{avgPrepMinutes !== null ? `${avgPrepMinutes} min` : "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-white/20">
                <span className="text-violet-200">Today's Total</span>
                <span className="font-bold">{todayOrders.length} Orders</span>
              </div>
            </div>
          </div>

          {/* Manual Add Card */}
          <div className="rounded-[2rem] bg-white border border-neutral-100 p-6 flex flex-col items-center justify-center shadow-sm min-h-[280px] cursor-pointer hover:bg-neutral-50 transition-colors">
            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
              <Plus size={32} className="text-neutral-400" />
            </div>
            <p className="text-lg font-bold text-neutral-500">Manual Add</p>
          </div>

          {/* View History Card */}
          <div className="rounded-[2rem] bg-white border border-neutral-100 p-6 flex flex-col items-center justify-center shadow-sm min-h-[280px] cursor-pointer hover:bg-neutral-50 transition-colors">
            <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
              <HistoryIcon size={32} className="text-neutral-400" />
            </div>
            <p className="text-lg font-bold text-neutral-500">View History</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-200 bg-white mt-4">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> POS Connected
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Printer Online
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>V2.4.1 Build 290</span>
          <span className="text-neutral-300">|</span>
          <span>Mood Drink Co., Ltd.</span>
        </div>
      </div>
    </div>
  );
}