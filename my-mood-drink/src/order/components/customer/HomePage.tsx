import { Smile, CalendarCheck, ChevronRight, HelpCircle, type LucideIcon } from "lucide-react";
import Poster from "../../../../public/images/Poster.png";
import PastelDrink from "../../../assets/PastelDrink.png";
import { PastelBackground, glass } from "../shared/pastel";

interface HomePageProps {
  onPickMood: () => void;
  onBookQueue: () => void;
}

function MenuRow({ icon: Icon, title, sub, onClick, primary }: {
  icon: LucideIcon; title: string; sub: string; onClick: () => void; primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-20 flex items-center gap-4 p-4 rounded-[26px] text-left active:scale-[0.98] transition ${glass.focus} ${
        primary
          ? "bg-gradient-to-br from-pink-600 to-fuchsia-600 text-white border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_14px_30px_-8px_rgba(219,39,119,0.5)]"
          : "bg-white/50 backdrop-blur-2xl border border-white/70 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_-10px_rgba(190,120,180,0.3)]"
      }`}
    >
      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${primary ? "bg-white/25" : "bg-violet-100"}`}>
        <Icon size={24} className={primary ? "text-white" : "text-violet-600"} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xl font-bold font-[itim] tracking-wide">{title}</span>
        <span className={`block text-sm mt-0.5 ${primary ? "text-white/90" : "text-slate-600"}`}>{sub}</span>
      </span>
      <ChevronRight size={20} className={primary ? "text-white" : "text-slate-400"} />
    </button>
  );
}

export function HomePage({ onPickMood, onBookQueue }: HomePageProps) {
  return (
    <PastelBackground>
      <header className="relative px-6 pt-9 pb-4 text-center">
        <button
          aria-label="วิธีใช้งาน"
          className={`absolute right-6 top-10 w-11 h-11 rounded-full bg-white/60 border border-white/80 text-fuchsia-700 flex items-center justify-center active:scale-95 transition ${glass.focus}`}
        >
          <HelpCircle size={18} />
        </button>
        <h1 className="text-6xl font-extrabold text-fuchsia-800 tracking-tight font-display" style={{ textShadow: "0 3px 0 rgba(255,255,255,0.7), 0 8px 20px rgba(150,70,170,0.25)" }}>
          Mood Drink
        </h1>
        <p className="mt-4 text-2xl font-medium text-slate-700 font-display">ดื่มตามฟีล ฮีลตามใจ</p>
      </header>

      {/* รูปสินค้าเป็นจุดโฟกัส */}
      <div className="px-6 mb-5">
        <div className={`${glass.panel} p-2`}>
          <img src={PastelDrink} alt="เครื่องดื่มซิกเนเจอร์ของร้าน" className="w-full aspect-[4/3] object-cover rounded-[22px]" />
        </div>
      </div>

      {/* หนึ่ง primary + หนึ่ง secondary */}
      <div className="px-6 flex flex-col gap-3 mb-8">
        <MenuRow primary icon={Smile} title="เลือกน้ำตามอารมณ์วันนี้" sub="Choose drink by mood" onClick={onPickMood} />
        <MenuRow icon={CalendarCheck} title="จองคิว / สั่งล่วงหน้า" sub="Book queue / Pre-order" onClick={onBookQueue} />
      </div>

      <div className="px-6 pb-10">
        <div className={`${glass.panel} max-w-sm mx-auto p-3`}>
          <img src={Poster} alt="โปรโมชันของร้าน Mood Drink" className="w-full object-cover rounded-2xl" />
        </div>
      </div>
    </PastelBackground>
  );
}