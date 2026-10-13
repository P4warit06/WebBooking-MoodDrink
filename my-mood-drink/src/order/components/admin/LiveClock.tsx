import { useEffect, useState } from "react";

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export function LiveClock({ showDate = false }: { showDate?: boolean }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div className="text-right">
      <p className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase">
        {showDate ? fmtDate(now) : "Current Time"}
      </p>
      <p className="text-3xl font-extrabold text-neutral-900 tracking-tight tabular-nums">{fmtTime(now)}</p>
    </div>
  );
}