import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, LoaderCircle, X } from "lucide-react";

type ModalTone = "info" | "success" | "danger";

interface AppModalProps {
  open: boolean;
  title: string;
  description: ReactNode;
  tone?: ModalTone;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const toneStyles: Record<ModalTone, { icon: string; button: string }> = {
  info: {
    icon: "bg-violet-100 text-violet-700",
    button: "from-rose-400 to-violet-400 hover:from-rose-500 hover:to-violet-500",
  },
  success: {
    icon: "bg-emerald-100 text-emerald-700",
    button: "from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600",
  },
  danger: {
    icon: "bg-rose-100 text-rose-700",
    button: "from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700",
  },
};

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  danger: AlertTriangle,
};

export function AppModal({
  open,
  title,
  description,
  tone = "info",
  confirmLabel = "ตกลง",
  cancelLabel,
  busy = false,
  onConfirm,
  onClose,
}: AppModalProps) {
  useEffect(() => {
    if (!open) return;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", closeWithEscape);
    return () => document.removeEventListener("keydown", closeWithEscape);
  }, [busy, onClose, open]);

  const Icon = toneIcons[tone];
  const styles = toneStyles[tone];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#49343e]/25 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !busy) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-modal-title"
            className="w-full max-w-md rounded-[2rem] border border-white/90 bg-[#fffaf8]/95 p-6 shadow-[0_28px_80px_rgba(111,72,91,.25)] backdrop-blur-2xl sm:p-7"
            initial={{ opacity: 0, y: 18, scale: .96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: .97 }}
            transition={{ duration: .2 }}
          >
            <div className="flex items-start gap-4">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${styles.icon}`}><Icon size={23} /></span>
              <div className="min-w-0 flex-1">
                <h2 id="app-modal-title" className="text-xl font-bold text-[#49343e]">{title}</h2>
                <div className="mt-2 text-sm leading-7 text-[#806a72]">{description}</div>
              </div>
              <button type="button" onClick={onClose} disabled={busy} aria-label="ปิด" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/75 text-[#806a72] hover:bg-rose-50 disabled:opacity-40"><X size={18} /></button>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {cancelLabel && <button type="button" onClick={onClose} disabled={busy} className="rounded-2xl border border-white bg-white/75 px-5 py-3 text-sm font-bold text-[#6f5360] shadow-sm hover:bg-white disabled:opacity-50">{cancelLabel}</button>}
              <button type="button" onClick={onConfirm} disabled={busy} className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-3 text-sm font-bold text-white shadow-lg transition disabled:cursor-wait disabled:opacity-60 ${styles.button}`}>
                {busy && <LoaderCircle size={17} className="animate-spin" />}
                {busy ? "กำลังดำเนินการ..." : confirmLabel}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
