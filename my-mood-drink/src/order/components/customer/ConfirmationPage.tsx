import { Plus } from "lucide-react";
import { TopBar } from "../shared/TopBar";
import { useOrderStatus } from "../../hooks/useOrder";

interface ConfirmationPageProps {
  orderId: string;
  onAddAnother: () => void;
  onHome: () => void;
}

const statusCopy: Record<string, string> = {
  pending: "รับออเดอร์แล้ว กำลังเข้าคิว",
  making: "กำลังเตรียมเครื่องดื่มให้คุณ",
  ready: "พร้อมเสิร์ฟแล้ว! มารับที่เคาน์เตอร์ได้เลย 🎉",
  completed: "รับเครื่องดื่มเรียบร้อยแล้ว ขอบคุณค่ะ",
};

export function ConfirmationPage({
  orderId,
  onAddAnother,
  onHome,
}: ConfirmationPageProps) {
  // Live-updates the instant the barista taps "ready" on the admin
  // dashboard — no polling, no refresh button needed on this screen.
  const order = useOrderStatus(orderId);

  if (!order) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-neutral-400">กำลังโหลดสถานะคิว...</p>
      </div>
    );
  }

  const isReady = order.status === "ready" || order.status === "completed";

  return (
    <div className="h-full flex flex-col">
      <TopBar title="สถานะคิวของคุณ" />

      <div className="px-6 pt-4 text-center">
        <p className="text-xs text-neutral-500 mb-1">คิวของคุณ</p>
        <p className="text-6xl font-bold text-neutral-800">
          #{order.queueNumber}
        </p>
      </div>

      <div className="px-6 pt-6">
        <div
          className={`rounded-2xl p-5 text-center transition-colors ${
            isReady
              ? "bg-emerald-50 border border-emerald-300"
              : "bg-neutral-50 border border-neutral-200"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              isReady ? "text-emerald-700" : "text-neutral-700"
            }`}
          >
            {statusCopy[order.status] ?? order.status}
          </p>
        </div>
      </div>

      <div className="px-6 pt-6 flex-1 overflow-y-auto">
        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <p className="text-sm font-semibold text-neutral-800 mb-2">
            {order.drinkName}
          </p>
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>ชื่อ / โต๊ะ</span>
            <span>{order.customerName}</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>ความหวาน</span>
            <span>{order.sweetnessLevel}</span>
          </div>
          {order.addons.length > 0 && (
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>ท็อปปิ้ง</span>
              <span>{order.addons.map((a) => a.name).join(", ")}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold text-neutral-800 mt-2 pt-2 border-t border-neutral-200">
            <span>ยอดรวม</span>
            <span>{order.totalPrice} บาท</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 pt-2 flex flex-col gap-2">
        <button
          onClick={onAddAnother}
          className="w-full py-3.5 rounded-2xl bg-white border border-neutral-200 text-neutral-700 text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <Plus size={16} />
          สั่งแก้วเพิ่มให้เพื่อน
        </button>
        <button
          onClick={onHome}
          className="w-full py-3 text-xs text-neutral-400"
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
