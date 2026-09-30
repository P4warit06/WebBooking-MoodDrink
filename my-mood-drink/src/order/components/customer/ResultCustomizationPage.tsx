import { useState } from "react";
import { Check, Info , Box} from "lucide-react";
import { TopBar } from "../shared/TopBar";
import { useAddons } from "../../hooks/useAddons";
import type { Mood, OrderDraft, SweetnessLevel } from "../../types";

const SWEETNESS_LEVELS: SweetnessLevel[] = ["50%", "ปกติ", "หวานมากพิเศษ"];

interface ResultCustomizationPageProps {
  mood: Mood;
  onBack: () => void;
  onConfirm: (draft: OrderDraft) => void;
}

/* ---------- Liquid Glass primitives ---------- */

const glassPanel =
  "relative overflow-hidden rounded-[28px] " +
  "bg-white/25 backdrop-blur-2xl backdrop-saturate-150 " +
  "border border-white/60 " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.25),0_16px_40px_-12px_rgba(190,120,180,0.28)]";

const glassInner =
  "relative rounded-2xl bg-white/35 backdrop-blur-md border border-white/60 " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]";

export function ResultCustomizationPage({
  mood,
  onBack,
  onConfirm,
}: ResultCustomizationPageProps) {
  const addonOptions = useAddons();
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [sweetness, setSweetness] = useState<SweetnessLevel>("ปกติ");

  const toggleAddon = (id: string) =>
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  const selectedAddons = addonOptions.filter((a) => addonIds.includes(a.id));
  const total =
    mood.basePrice + selectedAddons.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute top-40 -left-16 w-48 h-48 rounded-full bg-violet-300/35 blur-3xl" />
        <div className="absolute bottom-24 right-0 w-40 h-40 rounded-full bg-sky-300/30 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center px-2">
        <TopBar onBack={onBack} />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-medium text-slate-700 font-[itim] tracking-wide pointer-events-none">
          เครื่องดื่มของคุณ
        </h1>
      </div>

      <div className="relative z-10 px-6 pt-2 flex-1 overflow-y-auto pb-4">
        {/* ---------- Hero image ---------- */}
        <div className={`${glassPanel} mb-5 p-2`}>
          <div
            className="relative aspect-[5/4] overflow-hidden rounded-[22px]"
            style={{
              background: `linear-gradient(160deg, ${mood.colorLiquid}cc, ${mood.colorAccent}99)`,
            }}
          >
            {/* Specular highlight */}
            <div className="absolute -top-12 -left-8 w-40 h-40 rounded-full bg-white/50 blur-3xl pointer-events-none z-20" />
            {/* Top + bottom sheen */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-white/40 pointer-events-none z-10" />

            {mood.imageUrl ? (
              <img
                src={mood.imageUrl}
                alt={mood.drinkName || mood.name}
                className="absolute inset-0 z-0 h-full w-full object-contain object-center p-5"
              />
            ) : (
              <span className="absolute inset-0 z-0 flex items-center justify-center text-7xl drop-shadow">
                {mood.emoji}
              </span>
            )}

            {/* Floating price chip */}
            <div className="absolute bottom-3 right-3 z-30">
              <span
                className="inline-block text-sm font-bold text-white px-4 py-1.5 rounded-full
                           bg-gradient-to-br from-pink-400/95 to-rose-500/95 backdrop-blur-xl
                           border border-white/50
                           shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_-6px_rgba(236,72,153,0.6)]
                           font-[itim] tracking-wide"
              >
                {total} บาท
              </span>
            </div>
          </div>
        </div>

        {/* ---------- Title block ---------- */}
        <div className="text-center mb-6 px-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-pink-400/90 font-semibold">
            Your Perfect Match
          </p>
          <h2 className="text-[28px] leading-tight font-bold text-slate-800 mt-1.5 font-[itim] tracking-wide">
            {mood.drinkName || mood.name}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="w-8 h-px bg-white/70" />
            <span className="w-1.5 h-1.5 rounded-full bg-pink-300/80" />
            <h2 className="text-[14px] leading-tight  text-slate-800  font-[itim] tracking-wide">
            {mood.description }
          </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-300/80" />
            <span className="w-8 h-px bg-white/70" />
          </div>
        </div>

        {/* ---------- Sweetness selector ---------- */}
        <p className="text-sm font-semibold text-slate-700 mb-2 px-1 font-[itim]">
          ความหวาน
        </p>
        <div
          className="flex gap-2 mb-5 p-1.5 rounded-full
                     bg-white/20 backdrop-blur-2xl
                     border border-white/50
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_18px_-10px_rgba(190,120,180,0.3)]"
        >
          {SWEETNESS_LEVELS.map((lvl) => {
            const active = sweetness === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSweetness(lvl)}
                className={`flex-1 py-2.5 rounded-full text-xs font-medium transition-all duration-300
                  ${
                    active
                      ? "bg-gradient-to-br from-pink-400/95 to-rose-400/95 text-white border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_6px_16px_-4px_rgba(236,72,153,0.55)]"
                      : "text-slate-600 border border-transparent hover:bg-white/40"
                  }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* ---------- Add-ons ---------- */}
        <div className={`${glassPanel} p-4 mb-4`}>
          {/* Inner specular glow */}
          <div className="absolute -top-10 -left-8 w-28 h-28 bg-pink-400/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800 font-[itim]">
              เพิ่มท็อปปิ้ง (Add-on)
            </p>
            {selectedAddons.length > 0 && (
              <span
                className="text-[10px] font-semibold tracking-[0.15em] text-pink-600
                           bg-white/60 backdrop-blur-md border border-white/70
                           rounded-full px-2.5 py-1
                           shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
              >
                {selectedAddons.length} SELECTED
              </span>
            )}
          </div>

          <div className="relative z-10 flex flex-col gap-2">
            {addonOptions.length === 0 && (
              <p className="text-xs text-slate-400 py-2">ยังไม่มีท็อปปิ้ง</p>
            )}
            {addonOptions.map((addon) => {
              const checked = addonIds.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center justify-between gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-300 backdrop-blur-md
                    ${
                      checked
                        ? "bg-white/70 border border-pink-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_20px_-8px_rgba(244,114,182,0.45)]"
                        : "bg-white/35 border border-white/60 hover:bg-white/55"
                    }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-11 h-11 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-lg
                                 bg-gradient-to-br from-white/95 to-pink-100/60
                                 border border-white/80
                                 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_10px_-4px_rgba(190,120,180,0.35)]"
                    >
                      {addon.imageUrl ? (
                        <img
                          src={addon.imageUrl}
                          alt={addon.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                     <Box color=" #1C1A17 " />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800 font-[itim] truncate">
                        {addon.name}
                      </span>
                      <span className="block text-xs text-pink-500/90 mt-0.5 font-medium">
                        + {addon.price} บาท
                      </span>
                    </span>
                  </span>

                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300
                      ${
                        checked
                          ? "bg-gradient-to-br from-pink-400 to-rose-500 border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_10px_-2px_rgba(236,72,153,0.55)]"
                          : "border-white/70 bg-white/40"
                      }`}
                  >
                    {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Info note */}
          <div
            className="relative z-10 mt-3 flex items-start gap-2 rounded-2xl px-3 py-2.5
                       bg-sky-100/40 backdrop-blur-md border border-white/70
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
          >
            <Info size={14} className="text-sky-500 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-sky-900/75 font-[itim]">
              ท็อปปิ้งช่วยให้เครื่องดื่มโดดเด่น และเติมความสนุกให้แก้วของคุณมากขึ้น
            </p>
          </div>
        </div>
      </div>

      {/* ---------- CTA ---------- */}
      <div className="relative z-10 px-6 pb-8 pt-2">
        <button
          onClick={() =>
            onConfirm({
              mood,
              addons: selectedAddons.map(({ id, name, price }) => ({
                id,
                name,
                price,
              })),
              sweetnessLevel: sweetness,
              total,
            })
          }
          className="w-full py-4 rounded-full text-white font-semibold
                     active:scale-[0.98] transition-all duration-300
                     border border-white/40
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-8px_16px_rgba(190,24,93,0.25),0_14px_30px_-8px_rgba(236,72,153,0.6)]
                     font-[itim] text-base tracking-wide"
          style={{
            background: `linear-gradient(135deg, ${mood.colorAccent}dd, ${mood.colorAccent})`,
          }}
        >
          ยืนยันออเดอร์นี้
        </button>
        <p className="text-center text-[11px] text-slate-500/80 mt-3 font-[itim]">
          แล้วไปกรอกข้อมูลคิวต่อเลย
        </p>
      </div>
    </div>
  );
}