import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Mood } from "../types";


export function useMoods(includeInactive = false) {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = includeInactive ? collection(db, "moods") : query(collection(db, "moods"), where("active", "==", true));
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
  }, [includeInactive]);

  return { moods, loading };
}
