import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

/** Token: radius panel 28 · card 24 · control 16 · pill full | text ต่ำสุด slate-500 (ผ่าน 4.5:1 บนพื้นพาสเทล) */
export const glass = {
  panel:
    "relative overflow-hidden rounded-[28px] bg-white/45 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_40px_-14px_rgba(190,120,180,0.3)]",
  inner:
    "rounded-2xl bg-white/55 border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]",
  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-pink-50",
} as const;

export function PastelBackground({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-b from-pink-100 via-purple-100 to-sky-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-violet-300/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-sky-300/30 blur-3xl" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

/** ปุ่มหลักของทุกหน้า — ชมพูเข้ม (white text ≥ 4.5:1), สูง 56px สำหรับนิ้ว/คีออสก์ */
export function PrimaryButton({
  loading, sub, children, className = "", ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; sub?: string }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`w-full min-h-14 py-3 px-6 rounded-full text-white font-bold text-base font-[itim] tracking-wide
        bg-gradient-to-br from-pink-600 to-fuchsia-600 border border-white/50
        shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_14px_30px_-8px_rgba(219,39,119,0.55)]
        flex flex-col items-center justify-center active:scale-[0.98] transition disabled:opacity-45 disabled:cursor-not-allowed ${glass.focus} ${className}`}
    >
      <span className="flex items-center gap-2">
        {loading && <Loader2 size={18} className="animate-spin" />}
        {children}
      </span>
      {sub && <span className="text-xs font-normal text-white/90">{sub}</span>}
    </button>
  );
}

/** แถบ CTA ติดล่างจอ ไม่ให้ปุ่มหลักหลุดจอบนมือถือ */
export function StickyCTA({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 px-6 pt-4 pb-6 bg-gradient-to-t from-sky-100 via-sky-100/90 to-transparent">
      {children}
    </div>
  );
}