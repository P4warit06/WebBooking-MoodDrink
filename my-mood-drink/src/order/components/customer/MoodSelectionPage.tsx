import { Zap, Clover, Shuffle, HeartPulse, BatteryLow, Sun, type LucideIcon } from "lucide-react";
import { TopBar } from "../shared/TopBar";
import { PastelBackground, glass } from "../shared/pastel";
import { useMoods } from "../../hooks/useMood";
import type { Mood } from "../../types";

interface MoodSelectionPageProps {
  onBack: () => void;
  onSelectMood: (mood: Mood) => void;
}
const MOOD_ICON: Record<string, LucideIcon> = {
  "mood-01": BatteryLow, // เหนื่อยล้า
  "mood-02": Sun,        // ร้อนระอุ
  "mood-03": Zap,        // เปรี้ยวซ่าตื่นตัว
  "mood-04": Clover,     // ผ่อนคลายสบายใจ
  "mood-05": HeartPulse, // หวานละมุน
};

function MoodIcon({ mood }: { mood: Mood }) {
  const Icon = MOOD_ICON[mood.id];
  if (Icon) return <Icon size={26} color={mood.colorAccent} aria-hidden />;
  if (mood.emoji) return <span className="text-3xl" aria-hidden>{mood.emoji}</span>;
  if (mood.iconUrl) return <img src={mood.iconUrl} alt="" className="w-full h-full object-contain" />;
  return null;
}

export function MoodSelectionPage({ onBack, onSelectMood }: MoodSelectionPageProps) {
  const { moods, loading } = useMoods();

  const pickRandom = () => {
    if (moods.length === 0) return;
    onSelectMood(moods[Math.floor(Math.random() * moods.length)]);
  };

  return (
    <PastelBackground>
      <TopBar onBack={onBack} />

      <div className="px-6 py-3 text-center">
        <h1 className="text-2xl font-bold text-slate-800 leading-snug font-[itim] tracking-wide">
          วันนี้... เธอรู้สึกยังไง
          <br />
          ให้ <span className="text-pink-600">Mood Drink</span> จัดให้?
        </h1>
      </div>

      <div className="px-6 grid grid-cols-2 gap-4 flex-1 content-start pb-6">
        {loading && <p className="col-span-2 text-center text-sm text-slate-500 pt-10 font-[itim]">กำลังโหลด...</p>}
        {!loading && moods.length === 0 && (
          <p className="col-span-2 text-center text-sm text-slate-500 pt-10 font-[itim]">ตอนนี้ยังไม่มีเมนูให้เลือก ลองใหม่อีกครั้งหรือถามพนักงานนะ</p>
        )}
        {!loading &&
          moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood)}
              className={`${glass.panel} min-h-36 p-5 flex flex-col items-center justify-center gap-3 text-center active:scale-95 transition ${glass.focus}`}
            >
              <span
                className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border border-white/80"
                style={{ backgroundColor: mood.colorAccent ? `${mood.colorAccent}26` : "#f3e8ff" }}
              >
                <MoodIcon mood={mood} />
              </span>
              <span>
                <span className="block text-base font-semibold text-slate-800 leading-tight font-[itim]">{mood.name}</span>
                {mood.drinkName && <span className="block text-xs text-slate-600 mt-1 leading-tight">{mood.drinkName}</span>}
              </span>
            </button>
          ))}
      </div>

      <div className="px-6 pb-10 pt-2 flex flex-col items-center gap-2">
        <button
          onClick={pickRandom}
          disabled={moods.length === 0}
          className={`w-full min-h-14 rounded-full bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_-8px_rgba(244,114,182,0.45)] flex items-center justify-center gap-3 active:scale-[0.98] transition disabled:opacity-45 ${glass.focus}`}
        >
          <Shuffle size={20} className="text-pink-600" aria-hidden />
          <span className="text-base font-bold text-slate-800 font-[itim] tracking-wide">สุ่มฟีลให้ฉันที!</span>
        </button>
        <p className="text-xs text-slate-600 font-[itim]">ลองสุ่มดูสิ ว่าวันนี้ดื่มอะไรดีนะ?</p>
      </div>
    </PastelBackground>
  );
}