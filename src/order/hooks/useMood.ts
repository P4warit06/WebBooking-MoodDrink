import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, limit } from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Mood } from "../types";

export function useMoods() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // กรองเฉพาะที่ active == true และจำกัดจำนวนแค่ 5 อารมณ์
    const q = query(
      collection(db, "moods"), 
      where("active", "==", true),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMoods(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Mood)));
        setLoading(false);
      },
      (error) => {
        console.error("useMoods subscription failed:", error);
        setLoading(false);
      }
    );
    
    return unsubscribe;
  }, []);

  return { moods, loading };
}