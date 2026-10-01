import { FaceAngry, Zap, Clover, HelpCircle, Shuffle, HeartPulse, BatteryLow, Sun } from "lucide-react";
import { TopBar } from "../shared/TopBar";
import { useMoods } from "../../hooks/useMood";
import type { Mood } from "../../types";
import AvatarImg from "../../../assets/IconPeople.png";

interface MoodSelectionPageProps {
  onBack: () => void;
  onSelectMood: (mood: Mood) => void;
}


const glassCard =
  "relative overflow-hidden rounded-[26px] bg-gradient-to-br from-white/50 via-white/25 to-white/10 backdrop-blur-2xl backdrop-saturate-150 border border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.25),0_12px_28px_-10px_rgba(190,120,180,0.3)]";

const glassChip =
  "bg-white/25 backdrop-blur-2xl border border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]";

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
    <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-pink-100/60 via-purple-100/40 to-sky-100/60 min-h-screen">
      {/* Ambient color blobs — ให้ backdrop-blur มีอะไรหักเห */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 w-64 h-64 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-violet-300/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-sky-300/30 blur-3xl" />
      </div>

      {/* Top Navigation Bar & Profile Avatar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
        <TopBar onBack={onBack} />

        {/* รูปโปรไฟล์ตรงกลางด้านบน — glass ring */}
        <div className="absolute left-1/2 -translate-x-1/2 top-9">
          <div className="relative p-[3px] rounded-full bg-gradient-to-br from-white/80 via-white/40 to-white/10 backdrop-blur-xl border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_20px_-6px_rgba(190,120,180,0.4)]">
            <img
              src={AvatarImg}
              alt="User Profile"
              className="w-11 h-11 rounded-full border-2 border-white/80 object-cover"
            />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/50 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Title Header */}
      <div className="relative z-10 px-6 py-3 text-center">
        <h2 className="text-2xl font-bold text-slate-800 leading-snug font-[itim] tracking-wide">
          วันนี้... เธอรู้สึกยังไง
          <br />
          ให้ <span className="text-pink-400">Mood Drink</span> จัดให้?
        </h2>

        {/* แถบแคปซูลขีดเล็กๆ ใต้ข้อความ */}
        <div className="w-12 h-1 bg-white/70 rounded-full mx-auto mt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]" />
      </div>

      {/* Mood Grid Cards */}
      <div className="relative z-10 px-6 grid grid-cols-2 gap-4 flex-1 overflow-y-auto pb-6">
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
              className={`group ${glassCard} p-5 flex flex-col items-center justify-center gap-3 text-center
                       hover:from-white/65 hover:via-white/40 hover:to-white/20
                       hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_32px_-10px_rgba(244,114,182,0.45)]
                       active:scale-95 transition-all duration-300`}
            >
              {/* Specular highlight มุมซ้ายบนของการ์ด */}
              <span className="pointer-events-none absolute -top-12 -left-8 w-32 h-32 rounded-full bg-white/45 blur-2xl" />
              {/* เส้นไฮไลต์ขอบบน */}
              <span className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent" />

              {/* Image / Icon Container — glass orb */}
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden
                           border border-white/70
                           shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.25),0_6px_14px_-6px_rgba(190,120,180,0.35)]
                           transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: mood.colorAccent
                    ? `${mood.colorAccent}20`
                    : "#f3e8ff",
                }}
              >
                {mood.id === "mood-04" ? ( // ผ่อนคลายสบายใจ
                  <Clover color={mood.colorAccent} />
                ) : mood.id === "mood-03" ? ( // เปรี้ยวซ่าตื่นตัว
                  <Zap color={mood.colorAccent} />
                ) : mood.id === "mood-05" ? ( // หวานละมุน
                  <HeartPulse color={mood.colorAccent} />
                ) : mood.id === "mood-01" ? ( // เหนื่อยล้า
                  <BatteryLow color={mood.colorAccent} />
                ) : mood.id === "mood-02" ? ( // ร้อนระอุ
                  <Sun color={mood.colorAccent} />
                ) : mood.emoji ? (
                  <span className="text-3xl">{mood.emoji}</span>
                ) : mood.iconUrl ? (
                  <img
                    src={mood.iconUrl}
                    alt={mood.name}
                    className="w-full h-full object-contain"
                  />
                ) : null}

                {/* Glass overlay on icon orb */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-transparent" />
              </div>

              {/* ข้อความชื่อฟีล */}
              <div className="relative flex flex-col items-center">
                <span className="text-base font-semibold text-slate-800 leading-tight font-[itim]">
                  {mood.name}
                </span>
              </div>
            </button>
          ))}
      </div>

      {/* Random Button Section */}
      <div className="relative z-10 px-6 pb-10 pt-2 flex flex-col items-center gap-2">
        <div className="relative w-full">
          {/* ปุ่มสุ่มทรง Pill Capsule — liquid glass */}
          <button
            onClick={pickRandom}
            className="relative w-full py-3.5 px-6 rounded-full overflow-hidden
                       bg-gradient-to-br from-white/70 via-white/45 to-white/25
                       backdrop-blur-2xl backdrop-saturate-150
                       border border-white/70
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.25),0_12px_28px_-8px_rgba(244,114,182,0.45)]
                       flex items-center justify-center gap-3
                       hover:from-white/85 hover:via-white/60 hover:to-white/35
                       hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_32px_-8px_rgba(244,114,182,0.6)]
                       active:scale-[0.98]
                       transition-all duration-300 group"
          >
            {/* Specular highlight บนปุ่ม */}
            <span className="pointer-events-none absolute -top-10 left-1/4 w-40 h-24 rounded-full bg-white/50 blur-2xl" />
            <span className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

            <span className="relative w-8 h-8 rounded-xl flex items-center justify-center text-pink-500
                             bg-gradient-to-br from-pink-100/90 to-pink-200/60
                             border border-white/80
                             shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_10px_-4px_rgba(244,114,182,0.5)]
                             group-hover:rotate-12 transition-transform">
              <Shuffle size={18} />
            </span>
            <span className="relative text-base font-bold text-slate-800 font-[itim] tracking-wide">
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