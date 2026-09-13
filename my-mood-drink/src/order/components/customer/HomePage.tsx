import { Sparkles, MapPin } from "lucide-react";

interface HomePageProps {
  onPickMood: () => void;
  onBookQueue: () => void;
}

export function HomePage({ onPickMood, onBookQueue }: HomePageProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-10 pb-6 text-center">
        <p className="text-xs tracking-wide text-neutral-500 mb-1">
          ร้านเครื่องดื่มตามอารมณ์
        </p>
        <h1 className="text-4xl font-bold text-neutral-800">Mood Drink</h1>
        <p className="mt-2 text-sm text-neutral-600">
          ดื่มตามฟีล อีกเลเวลของอารมณ์ดี
        </p>
      </div>

      <div className="mx-6 rounded-3xl overflow-hidden shadow-lg shadow-pink-200/50 relative h-44 mb-6">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg,#F0669B 0%,#7C6FE0 100%)",
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center gap-2">
          <span className="text-5xl">🍹</span>
          <p className="text-white text-sm font-medium">
            อารมณ์ไหน ก็มีแก้วให้เธอ
          </p>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-3">
        <button
          onClick={onPickMood}
          className="w-full py-4 rounded-2xl bg-neutral-900 text-white font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md"
        >
          <Sparkles size={18} />
          เลือกน้ำตามอารมณ์วันนี้
        </button>
        <button
          onClick={onBookQueue}
          className="w-full py-4 rounded-2xl bg-white text-neutral-800 font-medium border border-neutral-200 flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <MapPin size={18} />
          จองคิว / สั่งล่วงหน้า
        </button>
      </div>

      <div className="mt-auto mx-6 mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
        <p className="text-sm text-amber-800">
          📸 ถ่ายโพลารอยด์กับเพื่อน ยื่นหน้าร้าน{" "}
          <span className="font-semibold">ลดทันที 10 บาท</span>
        </p>
      </div>
    </div>
  );
}
