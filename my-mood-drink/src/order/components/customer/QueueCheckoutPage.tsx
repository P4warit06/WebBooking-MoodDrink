import { useState } from "react";
import { ChevronLeft, Check, User, ShoppingBag } from "lucide-react";
import { createOrder } from "../../hooks/useOrder";
import type { Mood, OrderDraft } from "../../types";

interface QueueCheckoutPageProps {
  mood: Mood;
  orderDraft: OrderDraft;
  onBack: () => void;
  onSubmitted: (orderId: string) => void;
}

export function QueueCheckoutPage({
  mood,
  orderDraft,
  onBack,
  onSubmitted,
}: QueueCheckoutPageProps) {
  const [name, setName] = useState("");
  const [hasPolaroid, setHasPolaroid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalTotal = hasPolaroid
    ? Math.max(orderDraft.total - 10, 0)
    : orderDraft.total;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // The real queue number doesn't exist until this transaction commits —
      // it's assigned server-side inside createOrder(), never guessed here.
      const orderId = await createOrder(orderDraft, {
        customerName: name.trim(),
        hasPolaroidDiscount: hasPolaroid,
        finalTotal,
      });
      onSubmitted(orderId);
    } catch (e) {
      console.error(e);
      setError("ส่งออเดอร์ไม่สำเร็จ ลองกดใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #f9c9dd 0%, #e7d3f2 35%, #d5d9f4 65%, #bfe3f2 100%)",
      }}
    >
      {/* Ambient blobs for liquid-glass depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-purple-300/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-sky-300/40 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative flex items-center justify-center px-5 pt-6 pb-2">
        <button
          onClick={onBack}
          aria-label="ย้อนกลับ"
          className="absolute left-5 w-10 h-10 rounded-full flex items-center justify-center
                     bg-white/30 backdrop-blur-xl
                     border border-white/50
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_12px_rgba(0,0,0,0.06)]
                     active:scale-95 transition"
        >
          <ChevronLeft size={20} className="text-neutral-800" />
        </button>
        <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight font-[itim]">
          ยืนยันคิวของคุณ
        </h1>
      </div>

      <div className="relative px-6 pt-6 flex-1">
        {/* Name input card */}
        <div
          className="rounded-[24px] p-5 mb-4
                     bg-white/25 backdrop-blur-2xl
                     border border-white/50
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_-10px_rgba(160,120,200,0.3)]"
        >
          <p className="text-sm font-bold text-neutral-800 mb-3 font-[itim]">
            ข้อมูลสำหรับเรียกคิว
          </p>
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อเล่น หรือ เบอร์โต๊ะ/จุดที่นั่งรอ"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none
                         bg-white/60 backdrop-blur-md
                         border border-white/70
                         shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]
                         focus:border-pink-300 focus:bg-white/80
                         transition"
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-3">
            * เราจะใช้ข้อมูลนี้ในการส่งมอบเครื่องดื่มให้ถึงมือคุณ
          </p>
        </div>

        {/* Order summary */}
        <div
          className="rounded-[24px] p-4 mb-4
                     bg-white/20 backdrop-blur-2xl
                     border border-white/50
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_22px_-10px_rgba(160,120,200,0.28)]"
        >
          <p className="text-sm font-semibold text-neutral-800 mb-2">
            {mood.drinkName}
          </p>
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>ความหวาน</span>
            <span>{orderDraft.sweetnessLevel}</span>
          </div>
          {orderDraft.addons.length > 0 && (
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>ท็อปปิ้ง</span>
              <span>{orderDraft.addons.map((a) => a.name).join(", ")}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold text-neutral-800 mt-3 pt-3 border-t border-white/60">
            <span>ยอดรวม</span>
            <span>{finalTotal} บาท</span>
          </div>
        </div>

        {/* Polaroid toggle */}
        <button
          onClick={() => setHasPolaroid((v) => !v)}
          className={`w-full flex items-center gap-3 p-4 rounded-[20px] text-left transition backdrop-blur-2xl
            ${
              hasPolaroid
                ? "bg-amber-100/40 border border-amber-200/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_22px_-10px_rgba(245,158,11,0.4)]"
                : "bg-white/25 border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            }`}
        >
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition
              ${
                hasPolaroid
                  ? "bg-amber-500 border-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                  : "border-white/70 bg-white/40"
              }`}
          >
            {hasPolaroid && <Check size={12} className="text-white" />}
          </span>
          <span className="text-xs text-neutral-700">
            มีรูปโพลารอยด์ไหม? ยื่นตอนรับของ ลดทันที 10 บาท
          </span>
        </button>

        {error && (
          <p className="text-xs text-red-500 mt-3 text-center">{error}</p>
        )}
      </div>

      {/* CTA */}
      <div className="relative px-6 pb-6 pt-3">
        <button
          disabled={!name.trim() || submitting}
          onClick={handleSubmit}
          className="w-full py-4 rounded-full text-white font-medium
                     disabled:opacity-40 active:scale-[0.98] transition
                     flex flex-col items-center justify-center gap-0.5
                     border border-white/40
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-8px_16px_rgba(190,24,93,0.25),0_14px_30px_-8px_rgba(236,72,153,0.6)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(244,114,182,0.95) 0%, rgba(236,72,153,0.95) 100%)",
          }}
        >
          <span className="flex items-center gap-2 text-[15px]">
            <ShoppingBag size={16} />
            {submitting
              ? "กำลังส่งออเดอร์..."
              : "ยืนยันการจองคิว / ส่งออเดอร์ให้บาร์"}
          </span>
          {!submitting && (
            <span className="text-[10px] tracking-[0.2em] text-white/80">
              CONFIRM &amp; SEND ORDER TO BAR
            </span>
          )}
        </button>

        <p className="text-center text-[11px] text-neutral-500 mt-4 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-neutral-400/60" />
          Mood Drink Station
          <span className="w-6 h-px bg-neutral-400/60" />
        </p>
      </div>
    </div>
  );
}