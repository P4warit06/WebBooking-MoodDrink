import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Addon } from "../types";

export function useAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "addons"), where("active", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAddons(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Addon)));
      setLoading(false);
      setError(null);
    }, (cause) => {
      console.error("Add-ons subscription failed:", cause);
      setError("โหลดท็อปปิ้งไม่สำเร็จ กรุณาลองเปิดหน้านี้ใหม่");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { addons, loading, error };
}
