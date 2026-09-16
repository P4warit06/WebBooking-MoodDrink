import { Smile, CalendarCheck, ChevronRight, HelpCircle } from "lucide-react";

import Polaroid from "../../../assets/Polaroid.png";
import PastelDrink from "../../../assets/PastelDrink.png";

interface HomePageProps {
  onPickMood: () => void;
  onBookQueue: () => void;
}

export function HomePage({ onPickMood, onBookQueue }: HomePageProps) {
  return (
    // เพิ่ม pb-32 เพื่อเว้นพื้นที่ให้ BottomNav ไม่ทับเนื้อหาล่างสุด
    <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-32">
      {/* Logo header */}
      <div className="relative px-6 pt-9 pb-4 text-center">
        <button
          aria-label="วิธีใช้งาน"
          className="absolute right-6 top-10 w-8 h-8 rounded-full border-2 border-white/70 text-white flex items-center justify-center active:scale-95 transition"
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
        <p className="mt-8 text-2xl font-medium text-slate-700 font-display ">
          ดื่มตามฟีล ฮีลตามใจ
        </p>
      </div>

      {/* Hero photo */}
      <div className="px-8 mb-6">
        <div className=" shadow-xl shadow-purple-300/30">
          <img
            src={PastelDrink}
            alt="เครื่องดื่มซิกเนเจอร์ของร้าน"
            className="w-full aspect-square object-cover  shadow-xl"
          />
        </div>
      </div>

      {/* Menu rows */}
      <div className="px-6 flex flex-col gap-4 mb-8">
        {/* Mood Selector Button */}
        <button
          onClick={onPickMood}
          className="group relative w-full flex items-center gap-4 p-4 rounded-3xl 
               bg-gradient-to-br from-white/70 via-white/40 to-white/20 
               backdrop-blur-xl backdrop-saturate-150
               border border-white/70 
               shadow-[0_8px_32px_0_rgba(244,114,182,0.12),inset_0_1px_2px_0_rgba(255,255,255,0.9)]
               hover:shadow-[0_12px_40px_0_rgba(244,114,182,0.25),inset_0_1px_2px_0_rgba(255,255,255,1)]
               hover:bg-gradient-to-br hover:from-white hover:via-white hover:to-white
               hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.98] 
               transition-all duration-300 ease-out text-left overflow-hidden"
        >
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

          <div className="absolute -top-10 -left-10 w-28 h-28 bg-pink-400/20 rounded-full blur-2xl group-hover:scale-[1.8] group-hover:bg-pink-400/35 transition-all duration-500 ease-out pointer-events-none" />

          <span className="relative z-20 w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-200/90 to-pink-100/50 border border-white/80 shadow-[0_4px_12px_rgba(244,114,182,0.2)] group-hover:shadow-[0_6px_16px_rgba(244,114,182,0.35)] group-hover:-translate-y-0.5 group-hover:scale-105 flex items-center justify-center shrink-0 backdrop-blur-md transition-all duration-300">
            <Smile
              size={22}
              className="text-pink-600 drop-shadow-[0_2px_4px_rgba(219,39,119,0.3)] group-hover:scale-110 transition-transform duration-300"
            />
          </span>

          <span className="flex-1 min-w-0 z-20  py-4">
            <span className="pl-2 block text-xl font-bold text-neutral-800 tracking-wide group-hover:text-pink-950 transition-colors font-Kanit" >
              เลือกน้ำตามอารมณ์วันนี้
            </span>
            <span className="pl-2 block text-sm text-neutral-500 font-light mt-0.5 group-hover:text-neutral-600 transition-colors">
              Choose drink by mood
            </span>
          </span>

          <span className="z-20 p-1.5 rounded-full bg-pink-500/0 group-hover:bg-pink-500/10 transition-colors duration-300">
            <ChevronRight
              size={18}
              className="text-pink-400 shrink-0 group-hover:translate-x-1 group-hover:text-pink-500 transition-all duration-300"
            />
          </span>
        </button>

        {/* Queue / Pre-order Button */}
        <button
          onClick={onBookQueue}
          className="group relative w-full flex items-center gap-4 p-4 rounded-3xl 
               bg-gradient-to-br from-white/70 via-white/40 to-white/20 
               backdrop-blur-xl backdrop-saturate-150
               border border-white/70 
               shadow-[0_8px_32px_0_rgba(139,92,246,0.12),inset_0_1px_2px_0_rgba(255,255,255,0.9)]
               hover:shadow-[0_12px_40px_0_rgba(139,92,246,0.25),inset_0_1px_2px_0_rgba(255,255,255,1)]
               hover:bg-gradient-to-br hover:from-white hover:via-white hover:to-white
               hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.98] 
               transition-all duration-300 ease-out text-left overflow-hidden"
        >
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

          <div className="absolute -top-10 -left-10 w-28 h-28 bg-violet-400/20 rounded-full blur-2xl group-hover:scale-[1.8] group-hover:bg-violet-400/35 transition-all duration-500 ease-out pointer-events-none" />

          <span className="relative z-20 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-200/90 to-violet-100/50 border border-white/80 shadow-[0_4px_12px_rgba(139,92,246,0.2)] group-hover:shadow-[0_6px_16px_rgba(139,92,246,0.35)] group-hover:-translate-y-0.5 group-hover:scale-105 flex items-center justify-center shrink-0 backdrop-blur-md transition-all duration-300">
            <CalendarCheck
              size={22}
              className="text-violet-600 drop-shadow-[0_2px_4px_rgba(124,58,237,0.3)] group-hover:scale-110 transition-transform duration-300"
            />
          </span>

          <span className="flex-1 min-w-0 z-20 py-4">
            <span className=" pl-2 block text-xl font-bold text-neutral-800 tracking-wide group-hover:text-violet-950 transition-colors font-Kanit">
              จองคิว / สั่งล่วงหน้า
            </span>
            <span className="pl-2 block text-sm text-neutral-500 font-light mt-0.5 group-hover:text-neutral-600 transition-colors">
              Book queue / Pre-order
            </span>
          </span>

          <span className="z-20 p-1.5 rounded-full bg-violet-500/0 group-hover:bg-violet-500/10 transition-colors duration-300">
            <ChevronRight
              size={18}
              className="text-violet-400 shrink-0 group-hover:translate-x-1 group-hover:text-violet-500 transition-all duration-300"
            />
          </span>
        </button>
      </div>

      {/* Promo card */}
      <div className="px-8 pt-3">
        <div className="relative mx-auto max-w-sm">
          {/* แถบเทปกาวตกแต่งด้านบน */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-28 h-5 bg-purple-200/60 backdrop-blur-md border-x border-white/60 shadow-sm rounded-sm" />

          {/* การ์ดหลัก */}
          <div className="relative z-10 p-3 pt-6 rounded-3xl bg-white border-[3px] border-violet-200 shadow-xl shadow-purple-100/50 overflow-hidden">
            <div className="overflow-hidden rounded-2xl bg-neutral-100 aspect-[4/3]">
              <img
                src={Polaroid}
                alt="Polaroid Memory"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pt-4 pb-2 px-2 text-left">
              <h3 className="text-xl font-semibold text-slate-800 font-[itim] tracking-wide">
                ถ่ายรูปโพลาลอยด์กับเพื่อน
              </h3>
              <p className="mt-1 text-base font-semibold text-pink-400 font-[itim]">
                ยื่นหน้าร้านลด 10 บาท!
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-b-2 border-dashed border-sky-300/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
