import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Addon } from "../types";

export function useAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);

  useEffect(() => {
    const q = query(collection(db, "addons"), where("active", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAddons(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Addon)));
    });
    return unsubscribe;
  }, []);

  return addons;
}
