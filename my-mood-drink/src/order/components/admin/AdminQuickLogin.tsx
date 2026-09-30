import { useState } from "react";
import { Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "moodDrink:adminUnlocked";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminQuickLogin({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct =
      import.meta.env.VITE_ADMIN_PASSCODE ||
      (import.meta.env.DEV ? "1234" : undefined);

    if (correct && code === correct) {
      localStorage.setItem(STORAGE_KEY, "true");
      onClose();
      navigate("/admin");
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          onClick={onClose}
        >
          <motion.form
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="relative w-full max-w-xs bg-neutral-800 rounded-3xl p-6 flex flex-col items-center gap-4"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 text-neutral-500 hover:text-white"
            >
              <X size={18} />
            </button>
            <span className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center">
              <Lock size={20} className="text-neutral-300" />
            </span>
            <p className="text-sm text-neutral-300 font-medium">
              รหัสผ่านสำหรับพนักงาน
            </p>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              className={`w-full text-center tracking-[0.5em] text-lg py-3 rounded-xl bg-neutral-900 text-white outline-none border ${
                error ? "border-red-500" : "border-neutral-700"
              }`}
              placeholder="••••"
            />
            {error && (
              <p className="text-xs text-red-400 -mt-2">รหัสไม่ถูกต้อง</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-neutral-900 text-sm font-semibold active:scale-[0.98] transition"
            >
              เข้าสู่ระบบ
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}