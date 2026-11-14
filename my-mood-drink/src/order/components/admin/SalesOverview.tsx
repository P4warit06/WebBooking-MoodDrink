import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, type Timestamp } from "firebase/firestore";
import { Banknote, CalendarDays, CupSoda, Sparkles, ReceiptText, LoaderCircle, Search, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { db } from "../../../services/firebase";
import { archiveAndDeleteRejectedOrder, useDeletedOrderHistory, useOrderHistory, useTodayOrders } from "../../hooks/useAdminOrders";
import type { Order } from "../../types";
import { AppModal } from "../shared/AppModal";

type Slip = {
  orderId: string;
  imageData: string;
  submittedAt: number;
  queueNumber?: number;
  customerName?: string;
  totalPrice?: number;
  glassCount?: number;
  orderCreatedAt?: number;
};
type SearchResult = {
  id: string;
  order: Order | null;
  slip?: Slip;
  slipImageData?: string;
  source: string;
  originalOrderId?: string;
};
const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const dateKey = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
const drinkName = (item: Order["items"][number]) => item.drinkname || item.drinkName || "ไม่ระบุเมนู";
const formatDateLabel = (value: string) => new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeZone: "Asia/Bangkok",
}).format(new Date(`${value}T00:00:00+07:00`));

const formatSlipTime = (value: number) => value
  ? new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value))
  : "ไม่พบเวลา";

const ORDER_STATUS_LABEL: Record<Order["status"], string> = {
  pending: "รอดำเนินการ",
  making: "กำลังทำ",
  ready: "พร้อมเสิร์ฟ",
  completed: "รับแล้ว",
  cancelled: "ยกเลิก",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "รอชำระเงิน",
  submitted: "รอตรวจสลิป",
  verified: "ยืนยันยอดแล้ว",
  rejected: "สลิปไม่ผ่าน",
};

const searchMatches = (term: string, queueNumber?: number, customerName?: string) =>
  String(queueNumber ?? "").includes(term)
  || (customerName || "").toLocaleLowerCase("th-TH").includes(term);

export function SalesOverview() {
  const { orders: currentOrders, loading: currentLoading, error: currentError } = useTodayOrders();
  const { orders: archivedOrders, loading: historyLoading, error: historyError } = useOrderHistory();
  const { records: deletedRecords, loading: deletedLoading, error: deletedError } = useDeletedOrderHistory();
  const [slips, setSlips] = useState<Slip[]>([]);
  const [slipsLoading, setSlipsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [slipSearch, setSlipSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  useEffect(() => onSnapshot(query(collection(db, "paymentSlips"), orderBy("submittedAt", "desc")), snap => {
    setSlips(snap.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        orderId: docSnap.id,
        imageData: String(data.imageData || ""),
        submittedAt: (data.submittedAt as Timestamp | undefined)?.toMillis?.() ?? 0,
        queueNumber: typeof data.queueNumber === "number" ? data.queueNumber : undefined,
        customerName: typeof data.customerName === "string" ? data.customerName : undefined,
        totalPrice: typeof data.totalPrice === "number" ? data.totalPrice : undefined,
        glassCount: typeof data.glassCount === "number" ? data.glassCount : undefined,
        orderCreatedAt: typeof data.orderCreatedAt === "number" ? data.orderCreatedAt : undefined,
      };
    }));
    setSlipsLoading(false);
  }, cause => { console.error("Could not load slips:", cause); setSlipsLoading(false); }), []);

  const allOrders = useMemo(() => {
    const ordersById = new Map<string, Order>();
    archivedOrders.forEach(order => ordersById.set(order.id, order));
    currentOrders.forEach(order => ordersById.set(order.id, order));
    return [...ordersById.values()];
  }, [archivedOrders, currentOrders]);

  const ordersById = useMemo(
    () => new Map(allOrders.map(order => [order.id, order])),
    [allOrders],
  );

  const selectedOrders = useMemo(
    () => allOrders.filter(order => dateKey(order.createdAt) === selectedDate),
    [allOrders, selectedDate],
  );

  const paidOrders = selectedOrders.filter(order => order.paymentStatus === "verified" && order.status !== "cancelled");
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
  const selectedSlips = slips.filter(slip => {
    const order = ordersById.get(slip.orderId);
    const businessDate = order?.createdAt
      ? dateKey(order.createdAt)
      : dateKey(slip.orderCreatedAt || slip.submittedAt);
    return businessDate === selectedDate;
  });
  const selectedDeletedRecords = deletedRecords.filter(record => {
    const businessTime = record.order?.createdAt || record.slipSubmittedAt || record.deletedAt;
    return dateKey(businessTime) === selectedDate;
  });
  const normalizedSearch = slipSearch.trim().toLocaleLowerCase("th-TH");
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!normalizedSearch) return [];
    const results = new Map<string, SearchResult>();
    const add = (result: SearchResult) => {
      const existing = results.get(result.id);
      results.set(result.id, {
        ...existing,
        ...result,
        order: result.order || existing?.order || null,
        slip: result.slip || existing?.slip,
        slipImageData: result.slipImageData || existing?.slipImageData,
      });
    };

    selectedOrders.forEach(order => {
      if (searchMatches(normalizedSearch, order.queueNumber, order.customerName)) {
        add({
          id: order.id,
          order,
          source: archivedOrders.some(archived => archived.id === order.id) ? "ประวัติออเดอร์" : "คิวปัจจุบัน",
        });
      }
    });
    selectedDeletedRecords.forEach(record => {
      if (searchMatches(normalizedSearch, record.order?.queueNumber, record.order?.customerName)) {
        add({
          id: record.id,
          order: record.order,
          slipImageData: record.slipImageData,
          source: "ประวัติที่ถูกลบ",
          originalOrderId: record.originalOrderId,
        });
      }
    });
    selectedSlips.forEach(slip => {
      const order = ordersById.get(slip.orderId) || null;
      const queueNumber = order?.queueNumber ?? slip.queueNumber;
      const customerName = order?.customerName ?? slip.customerName;
      if (searchMatches(normalizedSearch, queueNumber, customerName)) {
        add({
          id: slip.orderId,
          order,
          slip,
          source: order ? "ข้อมูลออเดอร์และสลิป" : "ข้อมูลจากสลิป",
          originalOrderId: slip.orderId,
        });
      }
    });
    return [...results.values()].sort((a, b) => (a.order?.queueNumber ?? a.slip?.queueNumber ?? 0) - (b.order?.queueNumber ?? b.slip?.queueNumber ?? 0));
  }, [archivedOrders, normalizedSearch, ordersById, selectedDeletedRecords, selectedOrders, selectedSlips]);
  const selectedSearchResult = searchResults[0];
  const filteredSlips = selectedSlips.filter(slip => {
    if (!normalizedSearch) return true;
    const order = ordersById.get(slip.orderId);
    return searchMatches(normalizedSearch, order?.queueNumber ?? slip.queueNumber, order?.customerName ?? slip.customerName);
  });
  const selectedSlipIds = new Set(selectedSlips.map(slip => slip.orderId));
  const verifiedSlipOrderIds = new Set(selectedSlips
    .filter(slip => {
      const order = ordersById.get(slip.orderId);
      return order?.paymentStatus === "verified" && order.status !== "cancelled";
    })
    .map(slip => slip.orderId));
  const verifiedOrdersWithoutSlip = paidOrders.filter(order => !selectedSlipIds.has(order.id));
  const slipsWithoutOrder = selectedSlips.filter(slip => !ordersById.has(slip.orderId));
  const auditHasIssues = verifiedOrdersWithoutSlip.length > 0 || slipsWithoutOrder.length > 0;
  const loading = currentLoading || historyLoading || deletedLoading;
  const error = currentError || historyError || deletedError;
  const cards = [
    { label: "ยอดขายที่ยืนยันแล้ว", value: `${revenue.toLocaleString("th-TH")} ฿`, icon: Banknote, color: "text-emerald-700" },
    { label: "จำนวนแก้วที่ขาย", value: `${glasses} แก้ว`, icon: CupSoda, color: "text-sky-700" },
    { label: "เมนูขายดีที่สุด", value: bestDrink ? `${bestDrink[0]} · ${bestDrink[1]} แก้ว` : "ยังไม่มีข้อมูล", icon: Sparkles, color: "text-violet-700" },
    { label: "ท็อปปิ้งยอดนิยม", value: bestTopping ? `${bestTopping[0]} · ${bestTopping[1]} แก้ว` : "ยังไม่มีข้อมูล", icon: ReceiptText, color: "text-rose-700" },
  ];

  async function deleteRejectedOrder() {
    if (!pendingDeleteId) return;
    const orderId = pendingDeleteId;
    setDeletingId(orderId);
    setDeleteError("");
    try {
      await archiveAndDeleteRejectedOrder(orderId);
      setPendingDeleteId(null);
    } catch (cause) {
      console.error("Could not archive rejected order:", cause);
      setDeleteError(cause instanceof Error ? cause.message : "ลบรายการไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-7 text-slate-800 sm:px-8">
      <header className="admin-page-heading flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">Mood Drink · Sales Audit</span>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">ตรวจยอดขายและสลิปย้อนหลัง</h1>
          <p className="mt-1 text-sm text-slate-500">นับเฉพาะออเดอร์ที่ยืนยันการชำระเงิน และตัดรายการซ้ำตามรหัสออเดอร์</p>
        </div>
        <label className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 shadow-sm">
          <CalendarDays size={20} className="text-violet-600" />
          <span className="flex-1">
            <span className="block text-[11px] font-semibold text-slate-500">วันที่ต้องการตรวจสอบ</span>
            <input
              type="date"
              value={selectedDate}
              max={todayKey()}
              onChange={event => event.target.value && setSelectedDate(event.target.value)}
              className="mt-1 w-full bg-transparent text-sm font-bold outline-none"
            />
          </span>
        </label>
      </header>

      {error && <p role="alert" className="mb-4 rounded-2xl bg-rose-100/70 p-4 text-rose-800">{error}</p>}
      {loading ? (
        <p className="flex items-center gap-2 text-slate-500" role="status">
          <LoaderCircle className="animate-spin" /> กำลังโหลดข้อมูลยอดย้อนหลัง...
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm font-semibold text-slate-600">ข้อมูลวันที่ {formatDateLabel(selectedDate)}</p>
          <section className="slip-search-liquid mb-7 overflow-hidden rounded-[1.8rem] border border-white/80 shadow-[0_14px_40px_rgba(154,112,164,.16)] backdrop-blur-xl">
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(280px,.7fr)]">
              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-extrabold text-rose-800 shadow-sm">ค้นหาสลิป</span>
                  <h2 className="text-2xl font-extrabold text-slate-800">ค้นหาออเดอร์และสลิป</h2>
                </div>
                <label className="slip-search-input mt-5 flex items-center gap-3 rounded-2xl px-4 py-3">
                  <Search size={20} className="shrink-0 text-rose-600" />
                  <input
                    value={slipSearch}
                    onChange={event => setSlipSearch(event.target.value)}
                    placeholder="ค้นหาลำดับคิวหรือชื่อลูกค้า"
                    aria-label="ค้นหาลำดับคิวหรือชื่อลูกค้า"
                    className="w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </label>
                {!normalizedSearch ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-rose-200/80 bg-white/35 p-5 text-sm text-slate-600">
                    พิมพ์เลขคิว เช่น 40 หรือชื่อลูกค้า เพื่อค้นหาข้อมูลของวันที่เลือก
                  </div>
                ) : selectedSearchResult ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/80 bg-white/60 p-4">
                      <p className="text-xs font-semibold text-slate-500">ชื่อลูกค้า</p>
                      <strong className="mt-1 block text-lg">{selectedSearchResult.order?.customerName || selectedSearchResult.slip?.customerName || "ไม่พบข้อมูลลูกค้า"}</strong>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/60 p-4">
                      <p className="text-xs font-semibold text-slate-500">ยอด / จำนวนแก้ว</p>
                      <strong className="mt-1 block text-lg">{selectedSearchResult.order?.totalPrice ?? selectedSearchResult.slip?.totalPrice ?? "—"} ฿ · {selectedSearchResult.order?.items.length ?? selectedSearchResult.slip?.glassCount ?? "—"} แก้ว</strong>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/60 p-4 sm:col-span-2">
                      <p className="text-xs font-semibold text-slate-500">ตำแหน่งข้อมูล</p>
                      <strong className="mt-1 block text-rose-700">{selectedSearchResult.source}</strong>
                      <p className="mt-1 text-xs text-slate-500">คิว #{String(selectedSearchResult.order?.queueNumber ?? selectedSearchResult.slip?.queueNumber ?? "—").padStart(2, "0")} · รหัสออเดอร์ {selectedSearchResult.order?.id || selectedSearchResult.slip?.orderId || selectedSearchResult.originalOrderId}</p>
                    </div>
                    {selectedSearchResult.order && (
                      <div className="rounded-2xl border border-white/80 bg-white/60 p-4 sm:col-span-2">
                        <p className="text-xs font-semibold text-slate-500">สถานะออเดอร์ / การชำระเงิน</p>
                        <strong className={`mt-1 block text-lg ${selectedSearchResult.order.status === "cancelled" ? "text-rose-700" : "text-emerald-700"}`}>
                          {ORDER_STATUS_LABEL[selectedSearchResult.order.status]} · {PAYMENT_STATUS_LABEL[selectedSearchResult.order.paymentStatus || ""] || "ไม่พบสถานะการชำระเงิน"}
                        </strong>
                        {selectedSearchResult.order.paymentMessage && <p className="mt-1 text-sm text-slate-600">{selectedSearchResult.order.paymentMessage}</p>}
                      </div>
                    )}
                    {searchResults.length > 1 && <p className="text-xs font-semibold text-slate-500 sm:col-span-2">พบ {searchResults.length} รายการที่ตรงกัน — แสดงรายการแรก</p>}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-rose-200 bg-white/55 p-5 text-sm text-slate-600">
                    ไม่พบออเดอร์หรือสลิปที่ตรงกับ “{slipSearch.trim()}” ในวันที่เลือก
                  </div>
                )}
              </div>
              <div className="min-h-56 border-t border-white/70 bg-white/35 p-4 md:border-l md:border-t-0">
                {selectedSearchResult?.slip?.imageData || selectedSearchResult?.slipImageData ? (
                  <img src={selectedSearchResult.slip?.imageData || selectedSearchResult.slipImageData} alt="สลิปการชำระเงินที่ค้นหา" className="h-full max-h-80 w-full rounded-2xl bg-white/55 object-contain" />
                ) : (
                  <div className="grid h-full min-h-52 place-items-center rounded-2xl border border-dashed border-violet-200 bg-white/45 px-6 text-center text-sm text-slate-500">
                    {selectedSearchResult?.order?.status === "cancelled"
                      ? "พบข้อมูลออเดอร์ แต่ภาพสลิปถูกลบตอนยกเลิกออเดอร์"
                      : selectedSearchResult
                        ? "พบข้อมูลออเดอร์ แต่ไม่พบภาพสลิป"
                        : "ผลสลิปจะแสดงตรงนี้"}
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <article key={label} className="rounded-[1.7rem] border border-white/70 bg-white/55 p-5 shadow-[0_12px_35px_rgba(57,65,105,.12)] backdrop-blur-xl">
                <div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/80 shadow-inner ${color}`}><Icon size={21} /></div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-extrabold">{value}</p>
              </article>
            ))}
          </section>

          <section className={`mt-7 rounded-[1.8rem] border p-5 shadow-[0_12px_35px_rgba(57,65,105,.12)] backdrop-blur-xl sm:p-7 ${auditHasIssues ? "border-amber-200 bg-amber-50/70" : "border-emerald-200 bg-emerald-50/65"}`}>
            <div className="flex items-start gap-3">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${auditHasIssues ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                {auditHasIssues ? <TriangleAlert size={22} /> : <ShieldCheck size={22} />}
              </span>
              <div>
                <h2 className="text-lg font-bold">ผลตรวจจำนวนแก้วกับสลิป</h2>
                <p className="mt-1 text-sm text-slate-600">หนึ่งออเดอร์ถูกนับเพียงครั้งเดียว แม้ข้อมูลยังอยู่ทั้งในคิวและประวัติ</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/65 p-4"><p className="text-xs text-slate-500">ออเดอร์ยืนยันแล้ว</p><strong className="mt-1 block text-2xl">{paidOrders.length}</strong></div>
              <div className="rounded-2xl bg-white/65 p-4"><p className="text-xs text-slate-500">สลิปของออเดอร์ที่ยืนยัน</p><strong className="mt-1 block text-2xl">{verifiedSlipOrderIds.size}</strong></div>
              <div className="rounded-2xl bg-white/65 p-4"><p className="text-xs text-slate-500">จำนวนแก้วที่ยืนยัน</p><strong className="mt-1 block text-2xl">{glasses} แก้ว</strong></div>
            </div>
            {auditHasIssues ? (
              <p className="mt-4 text-sm font-semibold text-amber-800">
                พบรายการที่ควรตรวจสอบ · ออเดอร์ยืนยันแล้วแต่ไม่พบสลิป {verifiedOrdersWithoutSlip.length} รายการ · สลิปที่ไม่พบข้อมูลออเดอร์ {slipsWithoutOrder.length} รายการ
              </p>
            ) : (
              <p className="mt-4 text-sm font-semibold text-emerald-800">จำนวนออเดอร์ที่ยืนยันและสลิปตรงกัน</p>
            )}
          </section>

          <section className="mt-7 rounded-[1.8rem] border border-white/80 bg-white/55 p-5 shadow-[0_12px_35px_rgba(57,65,105,.12)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">สลิปย้อนหลัง</h2>
                <p className="mt-1 text-sm text-slate-500">สลิปของออเดอร์วันที่ {formatDateLabel(selectedDate)} รวมทั้งที่ผ่านและรอตรวจสอบ</p>
              </div>
              <span className="rounded-full bg-violet-100/80 px-3 py-1 text-sm font-bold text-violet-700">{filteredSlips.length} รายการ</span>
            </div>

            {deleteError && <p role="alert" className="mt-4 rounded-2xl bg-rose-100/80 p-4 text-sm font-semibold text-rose-800">{deleteError}</p>}

            {slipsLoading ? (
              <p className="mt-6 flex items-center gap-2 text-slate-500" role="status"><LoaderCircle className="animate-spin" /> กำลังโหลดสลิป...</p>
            ) : filteredSlips.length === 0 ? (
              <p className="py-10 text-center text-slate-500">{normalizedSearch ? "ไม่พบสลิปที่ตรงกับคำค้น" : "ไม่พบสลิปของวันที่เลือก"}</p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSlips.map(slip => {
                  const order = ordersById.get(slip.orderId);
                  const queueNumber = order?.queueNumber ?? slip.queueNumber;
                  const queueLabel = queueNumber ? String(queueNumber).padStart(2, "0") : "—";
                  const canDelete = !order || order.paymentStatus === "rejected";
                  const badge = !order
                    ? ["ไม่พบออเดอร์", "bg-rose-100 text-rose-800"]
                    : order.paymentStatus === "verified"
                      ? ["ตรวจแล้ว", "bg-emerald-100 text-emerald-800"]
                      : order.paymentStatus === "rejected"
                        ? ["ไม่ผ่าน", "bg-rose-100 text-rose-800"]
                        : ["รอตรวจ", "bg-amber-100 text-amber-800"];

                  return (
                    <article key={slip.orderId} className="overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-md backdrop-blur-lg">
                      <img src={slip.imageData} alt={`สลิปคิว ${queueLabel}`} className="h-56 w-full bg-slate-100/80 object-contain" />
                      <div className="p-4">
                        <div className="flex justify-between gap-2"><strong>คิว #{queueLabel}</strong><strong>{order?.totalPrice ?? slip.totalPrice ?? "—"} ฿</strong></div>
                        <p className="mt-1 text-sm text-slate-500">{order?.customerName || slip.customerName || "ไม่พบข้อมูลลูกค้า"}</p>
                        <p className="mt-1 text-xs text-slate-500">{order ? `${order.items.length} แก้ว` : slip.glassCount ? `${slip.glassCount} แก้ว` : "ไม่สามารถตรวจจำนวนแก้วได้"} · ส่งสลิป {formatSlipTime(slip.submittedAt)} น.</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <p className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${badge[1]}`}>{badge[0]}</p>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(slip.orderId)}
                              disabled={deletingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-50"
                            >
                              {deletingId === slip.orderId ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
                              {deletingId === slip.orderId ? "กำลังย้าย..." : "ลบและเก็บประวัติ"}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
      <AppModal
        open={pendingDeleteId !== null}
        title="ย้ายไปประวัติที่ถูกลบ?"
        description="รายการนี้จะถูกนำออกจากหน้าสลิปย้อนหลัง พร้อมเก็บข้อมูลและภาพสลิปไว้ในหน้า Deleted History"
        tone="danger"
        confirmLabel="ลบและเก็บประวัติ"
        cancelLabel="ยกเลิก"
        busy={deletingId !== null}
        onConfirm={deleteRejectedOrder}
        onClose={() => setPendingDeleteId(null)}
      />
    </main>
  );
}
