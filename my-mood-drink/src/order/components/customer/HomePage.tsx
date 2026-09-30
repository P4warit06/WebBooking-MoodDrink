import { Smile, CalendarCheck, ChevronRight, HelpCircle } from "lucide-react";

import Poster from "../../../../public/images/Poster.png"
import PastelDrink from "../../../assets/PastelDrink.png";

interface HomePageProps {
  onPickMood: () => void;
  onBookQueue: () => void;
}

/* Liquid Glass tokens (ใช้ร่วมกับหน้าอื่นใน flow)*/
const glassMenuButton =
  "group relative w-full flex items-center gap-4 p-4 rounded-[26px] " +
  "bg-gradient-to-br from-white/50 via-white/25 to-white/10 " +
  "backdrop-blur-2xl backdrop-saturate-150 " +
  "border border-white/55 " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.25),0_12px_28px_-10px_rgba(190,120,180,0.28)] " +
  "hover:from-white/70 hover:via-white/45 hover:to-white/20 " +
  "hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.98] " +
  "transition-all duration-300 ease-out text-left overflow-hidden";

export function HomePage({ onPickMood, onBookQueue }: HomePageProps) {
  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-32 relative">
      {/* Ambient color blobs — ให้ backdrop-blur มีมิติ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-violet-300/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-sky-300/30 blur-3xl" />
      </div>

      {/* ============ Logo header ============ */}
      <div className="relative z-10 px-6 pt-9 pb-4 text-center">
        <button
          aria-label="วิธีใช้งาน"
          className="absolute right-6 top-10 w-9 h-9 rounded-full
                     bg-white/25 backdrop-blur-xl
                     border border-white/60
                     text-white flex items-center justify-center
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_-4px_rgba(190,120,180,0.4)]
                     active:scale-95 transition"
        >
          <HelpCircle size={16} />
        </button>
        <h1
          className="text-6xl font-extrabold text-white tracking-tight font-display"
          style={{
            textShadow:
              "0 2px 0 rgba(0,0,0,0.10), 0 6px 18px rgba(120,60,150,0.25)",
          }}
        >
          Mood Drink
        </h1>
        <p className="mt-6 text-2xl font-medium text-slate-700 font-display">
          ดื่มตามฟีล ฮีลตามใจ
        </p>

        {/* Divider ornament — ให้สมดุลกับ space ด้านบน */}
        <div className="w-12 h-1 bg-white/70 rounded-full mx-auto mt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]" />
      </div>

      {/* ============ Hero photo — glass frame ============ */}
      <div className="relative z-10 px-6 mb-6">
        <div
          className="relative rounded-[28px] p-2
                     bg-gradient-to-br from-white/50 via-white/25 to-white/10
                     backdrop-blur-2xl backdrop-saturate-150
                     border border-white/55
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.25),0_16px_40px_-14px_rgba(190,120,180,0.4)]
                     overflow-hidden"
        >
          {/* Specular highlight streak */}
          <span className="pointer-events-none absolute -top-16 -left-10 w-48 h-48 rounded-full bg-white/45 blur-3xl z-20" />
          {/* Top edge highlight */}
          <span className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent z-20" />

          <div className="relative rounded-[22px] overflow-hidden">
            <img
              src={PastelDrink}
              alt="เครื่องดื่มซิกเนเจอร์ของร้าน"
              className="w-full aspect-square object-cover"
            />
            {/* Glass overlay ด้านบนของรูป */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* ============ Menu rows ============ */}
      <div className="relative z-10 px-6 flex flex-col gap-4 mb-8">
        {/* Mood Selector Button */}
        <button onClick={onPickMood} className={glassMenuButton}>
          {/* Shine sweep */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
          {/* Corner blob */}
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-pink-400/25 rounded-full blur-2xl group-hover:scale-[1.8] group-hover:bg-pink-400/40 transition-all duration-500 ease-out pointer-events-none" />
          {/* Top edge highlight */}
          <span className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent z-10" />

          {/* Icon orb — glass */}
          <span
            className="relative z-20 w-12 h-12 rounded-2xl
                       bg-gradient-to-br from-pink-100/90 to-pink-200/50
                       border border-white/80
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.3),0_6px_14px_-4px_rgba(244,114,182,0.5)]
                       group-hover:-translate-y-0.5 group-hover:scale-105
                       flex items-center justify-center shrink-0
                       overflow-hidden transition-all duration-300"
          >
            <Smile
              size={22}
              className="relative z-10 text-pink-600 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-transparent" />
          </span>

          <span className="flex-1 min-w-0 z-20 py-3">
            <span className="pl-2 block text-xl font-bold text-neutral-800 tracking-wide group-hover:text-pink-950 transition-colors font-Kanit">
              เลือกน้ำตามอารมณ์วันนี้
            </span>
            <span className="pl-2 block text-sm text-neutral-500 font-light mt-0.5 group-hover:text-neutral-600 transition-colors">
              Choose drink by mood
            </span>
          </span>

          <span className="z-20 p-1.5 rounded-full bg-pink-500/0 group-hover:bg-pink-500/15 transition-colors duration-300">
            <ChevronRight
              size={18}
              className="text-pink-400 shrink-0 group-hover:translate-x-1 group-hover:text-pink-500 transition-all duration-300"
            />
          </span>
        </button>

        {/* Queue / Pre-order Button */}
        <button onClick={onBookQueue} className={glassMenuButton}>
          {/* Shine sweep */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none z-10" />
          {/* Corner blob */}
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-violet-400/25 rounded-full blur-2xl group-hover:scale-[1.8] group-hover:bg-violet-400/40 transition-all duration-500 ease-out pointer-events-none" />
          {/* Top edge highlight */}
          <span className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent z-10" />

          {/* Icon orb — glass */}
          <span
            className="relative z-20 w-12 h-12 rounded-2xl
                       bg-gradient-to-br from-violet-100/90 to-violet-200/50
                       border border-white/80
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.3),0_6px_14px_-4px_rgba(139,92,246,0.5)]
                       group-hover:-translate-y-0.5 group-hover:scale-105
                       flex items-center justify-center shrink-0
                       overflow-hidden transition-all duration-300"
          >
            <CalendarCheck
              size={22}
              className="relative z-10 text-violet-600 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-transparent" />
          </span>

          <span className="flex-1 min-w-0 z-20 py-3">
            <span className="pl-2 block text-xl font-bold text-neutral-800 tracking-wide group-hover:text-violet-950 transition-colors font-Kanit">
              จองคิว / สั่งล่วงหน้า
            </span>
            <span className="pl-2 block text-sm text-neutral-500 font-light mt-0.5 group-hover:text-neutral-600 transition-colors">
              Book queue / Pre-order
            </span>
          </span>

          <span className="z-20 p-1.5 rounded-full bg-violet-500/0 group-hover:bg-violet-500/15 transition-colors duration-300">
            <ChevronRight
              size={18}
              className="text-violet-400 shrink-0 group-hover:translate-x-1 group-hover:text-violet-500 transition-all duration-300"
            />
          </span>
        </button>
      </div>

      {/* ============ Promo card — glass frame ============ */}
      <div className="relative z-10 px-6 pt-2">
        <div className="relative mx-auto max-w-sm">
          {/* แถบเทปกาวตกแต่งด้านบน — glass */}
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-28 h-5
                       bg-gradient-to-br from-purple-200/70 to-purple-100/40
                       backdrop-blur-xl
                       border-x border-white/70
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_10px_-4px_rgba(139,92,246,0.35)]
                       rounded-sm"
          />

          {/* การ์ดหลัก — glass */}
          <div
            className="relative z-10 p-3 pt-6 rounded-[26px]
                       bg-gradient-to-br from-white/65 via-white/40 to-white/20
                       backdrop-blur-2xl backdrop-saturate-150
                       border border-white/60
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.25),0_16px_36px_-14px_rgba(139,92,246,0.35)]
                       overflow-hidden"
          >
            {/* Specular highlight */}
            <span className="pointer-events-none absolute -top-12 -left-8 w-40 h-40 rounded-full bg-white/45 blur-2xl z-0" />
            {/* Top edge highlight */}
            <span className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent z-20" />

            <div className="relative rounded-2xl overflow-hidden bg-neutral-100">
              <img
                src={Poster}
                alt="Poster MoodDrink"
                className="w-full h-full object-cover"
              />
              {/* Glass overlay ด้านบนของรูป */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-dashed border-sky-300/60" />
          </div>
        </div>
      </div>
    </div>
  );
}