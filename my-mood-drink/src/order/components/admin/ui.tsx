import { useCallback, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Bell, Coffee, CheckCircle2, AlertTriangle, X, Loader2, type LucideIcon } from "lucide-react";
import type { Order } from "../../types";
import { LiveClock } from "./LiveClock";

/* ───────── Design tokens ─────────
 * Radius : card rounded-[2rem] · control rounded-2xl · chip rounded-full
 * Spacing: 4 / 8 / 12 / 16 / 24 / 32 (Tailwind 1,2,3,4,6,8)
 * Type   : display text-5xl/7xl · title text-xl/2xl · body text-sm · caption text-xs (min 11px)
 * Icons  : sm 14 · md 18 · lg 24 · xl 32
 * Shadow : shadow-sm (cards) · shadow-md + tinted colour (primary actions)
 */
export const ICON = { sm: 14, md: 18, lg: 24, xl: 32 } as const;

export const CARD = {
  base: "rounded-[2rem] border shadow-sm",
  white: "bg-white border-neutral-100",
  brand: "bg-violet-600 text-white border-transparent shadow-lg shadow-violet-500/20",
  success: "bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/20",
} as const;

export type Status = Order["status"];

export const STATUS: Record<
  Status,
  { label: string; badge: string; dot: string; card: string; number: string }
> = {
  pending:   { label: "NEW",       badge: "bg-violet-100 text-violet-800 border-violet-200",   dot: "bg-violet-500",  card: "bg-white border-violet-100",         number: "text-violet-600" },
  making:    { label: "PREPARING", badge: "bg-sky-100 text-sky-800 border-sky-200",            dot: "bg-sky-500",     card: "bg-sky-50/60 border-sky-100",        number: "text-sky-600" },
  ready:     { label: "READY",     badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500", card: "bg-emerald-50/60 border-emerald-200", number: "text-emerald-700" },
  completed: { label: "COMPLETED", badge: "bg-neutral-100 text-neutral-600 border-neutral-200", dot: "bg-neutral-400", card: "bg-neutral-50 border-neutral-200",     number: "text-neutral-500" },
  cancelled: { label: "CANCELLED", badge: "bg-red-100 text-red-700 border-red-200",            dot: "bg-red-500",     card: "bg-red-50/60 border-red-100",        number: "text-red-600" },
};

/** `note` may not exist on Order yet — add `note?: string` to ../../types */
export const getNote = (o: Order) => (o as Order & { note?: string }).note;

export function useTick(ms = 30000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

/* ───────── Status Badge ───────── */
export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

/* ───────── Action Button ───────── */
const VARIANT = {
  primary:   "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20",
  success:   "bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-500/20",
  onColor:   "bg-white hover:bg-emerald-50 text-emerald-800 shadow-md",
  secondary: "bg-white hover:bg-neutral-50 text-neutral-700 border-2 border-neutral-100",
  dark:      "bg-[#1e1e2d] hover:bg-neutral-800 text-white shadow-md",
  danger:    "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20",
} as const;
const SIZE = { sm: "min-h-11 px-4 text-xs rounded-xl", md: "min-h-12 px-6 text-sm rounded-2xl" } as const;

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  icon?: LucideIcon;
  loading?: boolean;
  block?: boolean;
};

export function ActionButton({ variant = "primary", size = "md", icon: Icon, loading, block, children, disabled, className = "", ...rest }: ActionButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${VARIANT[variant]} ${SIZE[size]} ${block ? "w-full" : ""} ${className}`}
    >
      {loading ? <Loader2 size={ICON.md} className="animate-spin" /> : Icon && <Icon size={ICON.md} />}
      {children}
    </button>
  );
}

/* ───────── Icon button + Notification ───────── */
export function IconButton({ label, icon: Icon, badge, onClick }: { label: string; icon: LucideIcon; badge?: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="relative w-11 h-11 rounded-xl bg-white flex items-center justify-center text-neutral-600 shadow-sm hover:bg-neutral-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <Icon size={20} />
      {!!badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

/** Bell showing how many orders are ready and waiting to be handed over */
export const Notification = ({ count, onClick }: { count: number; onClick?: () => void }) => (
  <IconButton label={`ออเดอร์รอส่งมอบ ${count} รายการ`} icon={Bell} badge={count} onClick={onClick} />
);

/* ───────── Header ───────── */
export function LiveBadge() {
  return (
    <span className="text-[11px] font-bold text-violet-800 bg-violet-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse motion-reduce:animate-none" aria-hidden /> Live Updates
    </span>
  );
}

export function Header({ section, chips, actions, showDate }: { section: string; chips?: ReactNode; actions?: ReactNode; showDate?: boolean }) {
  return (
    <header className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 px-4 md:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <Coffee size={ICON.lg} className="text-violet-600" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Mood Drink <span className="font-normal text-neutral-600">{section}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">{chips}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        <LiveClock showDate={showDate} />
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* ───────── System status + Quick action ───────── */
export function SystemStatus({ ok = true, label }: { ok?: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} aria-hidden /> {label}
    </span>
  );
}

export function QuickActionCard({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CARD.base} ${CARD.white} p-6 min-h-[280px] flex flex-col items-center justify-center hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400`}
    >
      <span className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon size={ICON.xl} className="text-neutral-500" />
      </span>
      <span className="text-lg font-bold text-neutral-600">{label}</span>
    </button>
  );
}

/* ───────── Toast ───────── */
export function useToast() {
  const [t, setT] = useState<{ msg: string; tone: "success" | "error" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const show = useCallback((msg: string, tone: "success" | "error" = "success") => {
    setT({ msg, tone });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setT(null), 3500);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const toastHost = t && (
    <div
      role={t.tone === "error" ? "alert" : "status"}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-lg ${t.tone === "error" ? "bg-red-600" : "bg-neutral-900"}`}
    >
      {t.tone === "error" ? <AlertTriangle size={ICON.md} /> : <CheckCircle2 size={ICON.md} className="text-emerald-400" />}
      {t.msg}
      <button type="button" aria-label="ปิด" onClick={() => setT(null)} className="ml-1 opacity-70 hover:opacity-100">
        <X size={ICON.sm} />
      </button>
    </div>
  );
  return { show, toastHost };
}

/* ───────── Confirmation dialog ───────── */
export function ConfirmDialog({ open, title, message, confirmLabel, busy, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel: string; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-msg" onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-xl">
        <h2 id="dlg-title" className="text-xl font-bold text-neutral-900">{title}</h2>
        <p id="dlg-msg" className="text-sm text-neutral-600 mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-8 justify-end">
          <ActionButton autoFocus variant="secondary" onClick={onCancel}>ยกเลิก</ActionButton>
          <ActionButton variant="danger" loading={busy} onClick={onConfirm}>{confirmLabel}</ActionButton>
        </div>
      </div>
    </div>
  );
}