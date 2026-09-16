import { HelpCircle, Shuffle } from "lucide-react";
import { TopBar } from "../shared/TopBar";
import { useMoods } from "../../hooks/useMood";
import type { Mood } from "../../types";
import AvatarImg from "../../../assets/IconPeople.png"; 

interface MoodSelectionPageProps {
  onBack: () => void;
  onSelectMood: (mood: Mood) => void;
}

export function MoodSelectionPage({
  onBack,
  onSelectMood,
}: MoodSelectionPageProps) {
  const { moods, loading } = useMoods();

  const pickRandom = () => {
    if (moods.length === 0) return;
    onSelectMood(moods[Math.floor(Math.random() * moods.length)]);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-pink-100/60 via-purple-100/40 to-sky-100/60 min-h-screen">
      {/* Top Navigation Bar & Profile Avatar */}
      <div className="relative flex items-center justify-between px-6 pt-6 pb-2">
        <TopBar onBack={onBack} />

        {/* รูปโปรไฟล์ตรงกลางด้านบน */}
        <div className="absolute left-1/2 -translate-x-1/2 top-6">
          <img
            src={AvatarImg}
            alt="User Profile"
            className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
          />
        </div>
      </div>

      {/* Title Header */}
      <div className="px-6 pt-3 pb-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 leading-snug font-[itim] tracking-wide">
          วันนี้... เธอรู้สึกยังไง
          <br />
          ให้ <span className="text-pink-400">Mood Drink</span> จัดให้?
        </h2>

        {/* แถบแคปซูลขีดเล็กๆ ใต้ข้อความ */}
        <div className="w-12 h-1 bg-white/70 rounded-full mx-auto mt-3" />
      </div>

      {/* Mood Grid Cards */}
      <div className="px-6 grid grid-cols-2 gap-4 flex-1 overflow-y-auto pb-6">
        {loading && (
          <p className="col-span-2 text-center text-sm text-neutral-400 pt-10 font-[itim]">
            กำลังโหลด...
          </p>
        )}
        {!loading &&
          moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood)}
              className="group relative rounded-3xl p-5 flex flex-col items-center justify-center gap-3 text-center 
                         bg-white/60 backdrop-blur-md border border-white/80 
                         shadow-[0_8px_20px_rgba(244,114,182,0.06)] 
                         hover:bg-white/80 hover:shadow-lg active:scale-95 transition-all duration-300"
            >
              {/* Icon Container ด้านใน */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: mood.colorAccent
                    ? `${mood.colorAccent}20`
                    : "#f3e8ff",
                }}
              >
                {mood.emoji}
              </div>

              {/* ข้อความชื่อฟีล */}
              <div className="flex flex-col items-center">
                <span className="text-base font-semibold text-slate-800 leading-tight font-[itim]">
                  {mood.name}
                </span>
                {mood.englishName && (
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                    {mood.englishName}
                  </span>
                )}
              </div>
            </button>
          ))}
      </div>

      {/* Random Button Section */}
      <div className="px-6 pb-10 pt-2 flex flex-col items-center gap-2">
        <div className="relative w-full">
          {/* ปุ่มสุ่มทรง Pill Capsule ขอบเรืองแสง */}
          <button
            onClick={pickRandom}
            className="w-full py-3.5 px-6 rounded-full bg-white/90 backdrop-blur-md 
                       border-2 border-pink-200/80 
                       shadow-[0_4px_20px_rgba(244,114,182,0.25)] 
                       flex items-center justify-center gap-3 
                       hover:bg-white hover:border-pink-300 active:scale-[0.98] 
                       transition-all duration-300 group"
          >
            <span className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-500 group-hover:rotate-12 transition-transform">
              <Shuffle size={18} />
            </span>
            <span className="text-base font-bold text-slate-800 font-[itim] tracking-wide">
              สุ่มฟีลให้ฉันที!
            </span>
          </button>

          {/* ไอคอนเครื่องหมาย ? เล็กๆ มุมขวาบนปุ่ม */}
          <button className="absolute -top-2 -right-1 text-pink-300 hover:text-pink-400 transition-colors">
            <HelpCircle size={18} />
          </button>
        </div>

        {/* ข้อความคำแนะนำใต้ปุ่ม */}
        <p className="text-xs text-neutral-400 font-[itim] tracking-wide mt-1">
          ลองสุ่มดูสิ ว่าวันนี้ดื่มอะไรดีนะ?
        </p>
      </div>
    </div>
  );
}
