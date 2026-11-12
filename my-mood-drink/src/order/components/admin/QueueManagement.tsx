import { useMemo, useState } from "react";
import { Search, RotateCcw, Eraser, Coffee, Bell, Calendar, ShoppingBag, LoaderCircle } from "lucide-react";
import { useTodayOrders, updateOrderStatus, resetDay, clearCompletedOrders } from "../../hooks/useAdminOrders";
import type { Order } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { useMoods } from "../../hooks/useMood";
import { OrderDetails } from "./OrderDetails";

const STATUS_LABEL: Record<string, string> = {
    pending: "รอจัดเตรียม",
    making: "กำลังทำ",
    ready: "พร้อมเสิร์ฟ",
    completed: "รับแล้ว",
    cancelled: "ยกเลิก",
};

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-violet-100 text-violet-800",
    making: "bg-amber-100 text-amber-700",
    ready: "bg-emerald-100 text-emerald-700",
    completed: "bg-neutral-100 text-neutral-400",
    cancelled: "bg-red-100 text-red-600",
};

function formatClock(ms: number) {
    return new Date(ms).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(ms: number) {
    return new Date(ms).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function QueueManagement() {
    const { orders: allOrders, loading, error } = useTodayOrders();
    const orders = useMemo(() => allOrders.filter(order => !order.paymentStatus || order.paymentStatus === "verified"), [allOrders]);
    const { moods } = useMoods(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [busy, setBusy] = useState(false);

    const pending = orders.filter((o) => o.status === "pending" || o.status === "making");
    const ready = orders.filter((o) => o.status === "ready");
    const completed = orders.filter((o) => o.status === "completed");
    const totalGlasses = orders.filter(o => o.status !== "cancelled").reduce((sum, order) => sum + (order.items?.length || 0), 0);
    const totalSales = orders.filter(o => o.status !== "cancelled").reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const currentlyServing = ready[0] ?? null;
    const nextInQueue = pending.find((o) => o.status === "pending") ?? null;

    const filtered = useMemo(() => {
        if (!search.trim()) return orders;
        const s = search.trim().toLowerCase();
        return orders.filter(
            (o) => String(o.queueNumber).includes(s) || o.customerName.toLowerCase().includes(s)
        );
    }, [orders, search]);

    const handleCallNext = async (order: Order) => {
        setBusyId(order.id);
        try {
            await updateOrderStatus(order.id, "making");
        } catch (e) {
            console.error(e);
            alert("อัปเดตไม่สำเร็จ ลองใหม่อีกครั้ง");
        } finally {
            setBusyId(null);
        }
    };

    const handlePickUp = async (order: Order) => {
        setBusyId(order.id);
        try {
            await updateOrderStatus(order.id, "completed");
        } catch (e) {
            console.error(e);
            alert("อัปเดตไม่สำเร็จ ลองใหม่อีกครั้ง");
        } finally {
            setBusyId(null);
        }
    };

    const handleResetQueue = async () => {
        if (!confirm(`จบวันนี้และเคลียร์คิวทั้งหมด (${orders.length} ออเดอร์)? ข้อมูลจะถูกย้ายไปเก็บใน orderHistory ก่อน ไม่ได้ลบทิ้ง`)) return;
        setBusy(true);
        try {
            const count = await resetDay();
            alert(`เคลียร์คิวแล้ว ${count} ออเดอร์ พร้อมเริ่มวันใหม่ที่คิว #1`);
        } catch (e) {
            console.error(e);
            alert("รีเซ็ตคิวไม่สำเร็จ ลองใหม่อีกครั้ง");
        } finally {
            setBusy(false);
        }
    };

    const handleClearCompleted = async () => {
        setBusy(true);
        try {
            const count = await clearCompletedOrders();
            alert(`ย้ายออเดอร์ที่รับแล้ว ${count} รายการเข้าประวัติเรียบร้อย`);
        } catch (e) {
            console.error(e);
            alert("เคลียร์ไม่สำเร็จ ลองใหม่อีกครั้ง");
        } finally {
            setBusy(false);
        }
    };

    // Mock current time for the header display to match the image
    const now = new Date();
    const currentTimeString = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const currentDateString = formatDate(now.getTime());

    return (
        <div className="min-h-screen w-full bg-[#fcfcfd] px-4 py-6 md:px-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-violet-100 rounded-xl text-violet-600">
                        <Coffee size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Mood Drink Queue Management</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-[11px] font-bold text-neutral-500 tracking-wider">SYSTEM ACTIVE</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-2 text-neutral-600">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">{currentDateString}</span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 tracking-tight">{currentTimeString}</div>
                </div>
            </div>

            {loading && <p role="status" className="flex items-center gap-2 text-slate-500 mb-5"><LoaderCircle size={18} className="animate-spin" /> กำลังโหลดข้อมูลคิว...</p>}
            {error && <p role="alert" className="rounded-2xl bg-red-50 text-red-700 p-4 mb-5">{error}</p>}
            {/* Currently serving / next up */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Currently Serving Card */}
                <div className="rounded-[2rem] bg-[#4ab88a] text-white p-8 relative overflow-hidden shadow-lg shadow-emerald-500/20">
                    <p className="text-xs font-bold tracking-widest text-emerald-50 mb-2 uppercase">Currently Serving</p>
                    {currentlyServing ? (
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-col">
                                <p className="text-7xl font-extrabold tracking-tighter">
                                    #{String(currentlyServing.queueNumber).padStart(3, "0")}
                                </p>
                                <div className="flex items-center gap-2 mt-6 bg-white/20 px-4 py-2 rounded-full w-fit backdrop-blur-sm">
                                    <Bell size={16} className="text-white" />
                                    <span className="text-sm font-medium">พร้อมรับเครื่องดื่ม</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                                    <Coffee size={32} className="text-white" />
                                </div>
                                <p className="text-xl font-bold">K. {currentlyServing.customerName}</p>
                                <p className="text-sm text-emerald-100 mt-1">
                                    {currentlyServing.items?.length || 0} รายการ
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg text-emerald-50 py-12 text-center font-medium">ยังไม่มีออเดอร์พร้อมเสิร์ฟ</p>
                    )}
                </div>

                {/* Next in Queue Card */}
                <div className="rounded-[2rem] bg-white border border-neutral-100 p-8 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold tracking-widest text-violet-500 mb-2 uppercase">Next in Queue</p>
                    {nextInQueue ? (
                        <div className="flex items-end justify-between mt-2">
                            <div className="flex flex-col">
                                <p className="text-6xl font-extrabold text-neutral-900 tracking-tighter">
                                    #{String(nextInQueue.queueNumber).padStart(3, "0")}
                                </p>
                                <div className="mt-4 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg w-fit text-xs font-bold">
                                    กำลังรอจัดเตรียม
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-4">
                                <div>
                                    <p className="text-lg font-bold text-neutral-800">K. {nextInQueue.customerName}</p>
                                    <p className="text-sm text-neutral-500 mt-0.5">
                                        {nextInQueue.items?.length || 0} รายการ
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleCallNext(nextInQueue)}
                                    disabled={busyId !== null}
                                    className="flex items-center gap-2 text-sm font-bold bg-[#8b5cf6] hover:bg-violet-700 text-white px-6 py-3 rounded-xl shadow-md shadow-violet-500/30 active:scale-[0.98] transition-all"
                                >
                                    {busyId === nextInQueue.id ? <><LoaderCircle size={16} className="animate-spin" /> กำลังอัปเดต...</> : "เริ่มจัดเตรียม"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg text-neutral-400 py-12 text-center font-medium">ไม่มีคิวถัดไป</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2.5fr_1fr] gap-6">
                {/* Queue timeline */}
                <div className="rounded-[2rem] bg-white border border-neutral-100 p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <p className="text-xl font-bold text-neutral-900">Queue Timeline</p>
                        <div className="relative w-full sm:w-auto">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search Queue # or Name"
                                className="w-full sm:w-64 pl-11 pr-4 py-3 text-sm rounded-xl bg-neutral-50 border-none outline-none focus:ring-2 focus:ring-violet-200 transition-all placeholder:text-neutral-400"
                            />
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-[11px] font-bold text-neutral-400 tracking-wider uppercase border-b border-neutral-100 mb-2">
                        <div className="md:col-span-2">Queue #</div>
                        <div className="col-span-4">Customer</div>
                        <div className="md:col-span-2">Status</div>
                        <div className="md:col-span-2">Time Ordered</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    <div className="flex flex-col max-h-[400px] overflow-y-auto pr-2">
                        {!loading && !error && filtered.length === 0 && (
                            <p className="text-center text-sm text-neutral-400 py-12">ไม่พบออเดอร์</p>
                        )}
                        <AnimatePresence initial={false}>
                            {filtered.map((o) => (
                                <motion.div
                                    key={o.id}
                                    layout
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-5 px-4 border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors rounded-xl"
                                >
                                    <div className="md:col-span-2">
                                        <span className="text-xl font-bold text-neutral-800 tracking-tight">
                                            #{String(o.queueNumber).padStart(3, "0")}
                                        </span>
                                    </div>
                                    
                                    <div className="md:col-span-4 flex flex-col">
                                        <span className="font-bold text-neutral-800 text-sm">K. {o.customerName}</span>
                                        <span className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                                            <ShoppingBag size={12}/>
                                            {o.items?.length || 0} รายการ
                                        </span>
                                    </div>

                                    <div className="md:col-span-2">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide ${STATUS_STYLE[o.status]}`}>
                                            {STATUS_LABEL[o.status]}
                                        </span>
                                    </div>

                                    <div className="md:col-span-2 text-sm text-neutral-600 font-medium">
                                        {formatClock(o.createdAt)}
                                    </div>

                                    <div className="md:col-span-2 flex justify-end">
                                        {o.status === "ready" ? (
                                            <button
                                                onClick={() => handlePickUp(o)}
                                                disabled={busyId !== null}
                                                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors"
                                            >
                                                {busyId === o.id ? <span className="flex items-center gap-1"><LoaderCircle size={14} className="animate-spin" /> กำลังอัปเดต...</span> : "รับแล้ว"}
                                            </button>
                                        ) : null}
                                    </div>
                                    <details className="md:col-span-12 bg-slate-50 rounded-2xl p-3">
                                        <summary className="cursor-pointer text-sm font-semibold text-violet-700">ดูรายละเอียดเครื่องดื่ม</summary>
                                        <div className="mt-3"><OrderDetails order={o} moods={moods} /></div>
                                    </details>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Summary + actions */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-[2rem] bg-white border border-neutral-100 p-8 shadow-sm">
                        <p className="text-xl font-bold text-neutral-900 mb-6">Queue Summary</p>
                        <div className="grid grid-cols-2 gap-3 mb-4"><div className="rounded-2xl bg-pink-50 py-4 text-center"><p className="text-[11px] font-bold text-pink-500">GLASSES</p><p className="text-2xl font-extrabold text-pink-700">{totalGlasses}</p><p className="text-xs text-pink-600">แก้ว</p></div><div className="rounded-2xl bg-sky-50 py-4 text-center"><p className="text-[11px] font-bold text-sky-500">SALES</p><p className="text-2xl font-extrabold text-sky-700">{totalSales.toLocaleString("th-TH")}</p><p className="text-xs text-sky-600">บาท</p></div></div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="rounded-2xl bg-blue-50/50 py-6 flex flex-col items-center justify-center">
                                <p className="text-[11px] font-bold text-blue-500 tracking-wider mb-2">PENDING</p>
                                <p className="text-4xl font-extrabold text-blue-700">{pending.length}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-50/50 py-6 flex flex-col items-center justify-center">
                                <p className="text-[11px] font-bold text-emerald-500 tracking-wider mb-2">READY</p>
                                <p className="text-4xl font-extrabold text-emerald-600">{ready.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            disabled={busy || busyId !== null}
                            onClick={handleResetQueue}
                            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#1e1e2d] text-white text-sm font-bold disabled:opacity-40 hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-md"
                        >
                            {busy ? <LoaderCircle size={18} className="animate-spin" /> : <RotateCcw size={18} />} {busy ? "กำลังดำเนินการ..." : "Reset Queue"}
                        </button>
                        <button
                            disabled={busy || busyId !== null || completed.length === 0}
                            onClick={handleClearCompleted}
                            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border-2 border-neutral-100 text-neutral-700 text-sm font-bold disabled:opacity-40 hover:bg-neutral-50 active:scale-[0.98] transition-all"
                        >
                            {busy ? <LoaderCircle size={18} className="animate-spin" /> : <Eraser size={18} />} {busy ? "กำลังดำเนินการ..." : "Clear Completed"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
