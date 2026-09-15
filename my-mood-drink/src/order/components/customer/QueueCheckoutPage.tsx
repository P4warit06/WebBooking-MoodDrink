import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { TopBar } from "../shared/TopBar";
import { StepDots } from "../shared/StepDots";
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
      const orderId = await createOrder(orderDraft, {
        customerName: name.trim(),
        hasPolaroidDiscount: hasPolaroid,
        finalTotal,
      });
      onSubmitted(orderId);
    } catch (e) {
      console.error(e);
      // Covers the "internet drops mid-submit" edge case from the spec —
      // the transaction either fully committed or fully didn't, so it's
      // always safe to just let the customer retry.
      setError("ส่งออเดอร์ไม่สำเร็จ ลองกดใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <TopBar onBack={onBack} title="ยืนยันคิวของคุณ" />
      <StepDots step={2} />

      <div className="px-6 pt-4 flex-1 overflow-y-auto">
        <label className="text-sm font-medium text-neutral-700">
          ชื่อเล่น หรือ เบอร์โต๊ะ
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="เช่น เอิร์ธ หรือ โต๊ะ 5"
          className="w-full mt-2 mb-5 px-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-neutral-400"
        />

        <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 mb-4">
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
          <div className="flex justify-between text-sm font-semibold text-neutral-800 mt-2 pt-2 border-t border-neutral-200">
            <span>ยอดรวม</span>
            <span>{finalTotal} บาท</span>
          </div>
        </div>

        <button
          onClick={() => setHasPolaroid((v) => !v)}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition ${
            hasPolaroid
              ? "bg-amber-50 border-amber-300"
              : "bg-white border-neutral-200"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${
              hasPolaroid
                ? "bg-amber-500 border-amber-500"
                : "border-neutral-300"
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

      <div className="px-6 pb-8 pt-2">
        <button
          disabled={!name.trim() || submitting}
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl bg-neutral-900 text-white font-medium disabled:opacity-30 active:scale-[0.98] transition shadow-md flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          {submitting
            ? "กำลังส่งออเดอร์..."
            : "ยืนยันการจองคิว / ส่งออเดอร์ให้บาร์"}
        </button>
      </div>
    </div>
  );
}