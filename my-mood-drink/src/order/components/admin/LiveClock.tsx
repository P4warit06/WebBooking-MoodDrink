import { useEffect, useState } from "react";

function formatTime(d: Date) {
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  // นำ useEffect ที่จัดการ visibilitychange มาไว้ข้างใน Component
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
  }, []); // ตัวแปร setNow สามารถเรียกใช้ได้แล้วเพราะอยู่ใน Scope เดียวกัน

  return (
    <div className="text-right">
      <p className="text-xs text-neutral-400">Current Time</p>
      <p className="text-sm font-semibold text-neutral-700 tabular-nums">
        {formatTime(now)}
      </p>
    </div>
  );
}