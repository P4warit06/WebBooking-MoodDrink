import { useState, type ReactNode } from "react";
import { Lock, LogOut } from "lucide-react";

const STORAGE_KEY = "moodDrink:adminUnlocked";

export function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct =
      import.meta.env.VITE_ADMIN_PASSCODE ||
      (import.meta.env.DEV ? "1234" : undefined);

    if (!correct) {
      console.error("VITE_ADMIN_PASSCODE is not set in .env");
      setError(true);
      return;
    }

    if (code === correct) {
      localStorage.setItem(STORAGE_KEY, "true"); // ✅ เปลี่ยน
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-900 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs bg-neutral-800 rounded-3xl p-6 flex flex-col items-center gap-4"
      >
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
          <p className="text-xs text-red-400 -mt-2">
            รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้ง
          </p>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-white text-neutral-900 text-sm font-semibold active:scale-[0.98] transition"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}