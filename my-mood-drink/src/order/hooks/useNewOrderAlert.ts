import { useEffect, useRef, useState } from "react";
import type { Order } from "../types";

export function useNewOrderAlert(orders: Order[]) {
  const prevIds = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));
    const added = new Set<string>();
    currentIds.forEach((id) => {
      if (!prevIds.current.has(id)) added.add(id);
    });

    if (added.size > 0 && prevIds.current.size > 0) {
      setNewIds(added);
      // เล่นเสียงแจ้งเตือน (optional)
      try {
        const audio = new Audio("/sounds/ding.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}
      const timer = setTimeout(() => setNewIds(new Set()), 3000);
      return () => clearTimeout(timer);
    }
    prevIds.current = currentIds;
  }, [orders]);

  return newIds;
}