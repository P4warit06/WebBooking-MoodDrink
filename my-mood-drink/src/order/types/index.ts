export interface Mood {
  iconUrl: string | undefined;
  imageUrl: string | undefined;
  id: string;
  emoji: string;
  name: string;
  drinkName: string;
  description: string;
  basePrice: number;
  colorAccent: string;
  colorLiquid: string;
  active: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  active: boolean;
  imageUrl?: string;
}

export type SweetnessLevel = "50%" | "ปกติ" | "หวานมากพิเศษ";

export type OrderStatus =
  | "pending"
  | "making"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderAddon {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  queueNumber: number;
  customerName: string;
  moodId: string;
  drinkName: string; // snapshot at order time — survives later menu edits
  addons: OrderAddon[];
  sweetnessLevel: SweetnessLevel;
  totalPrice: number;
  hasPolaroidDiscount: boolean;
  status: OrderStatus;
  createdAt: number; // millis, converted from Firestore Timestamp
  updatedAt: number;
  servedAt: number | null;
}

export interface DailyCounter {
  date: string; // "YYYY-MM-DD", Asia/Bangkok
  lastQueueNumber: number;
}

// Local, in-progress state before an order is submitted — never touches Firestore.
export interface OrderDraft {
  mood: Mood;
  addons: OrderAddon[];
  sweetnessLevel: SweetnessLevel;
  total: number;
}
