import type { Mood, OrderItem } from "../types";

// Local copies of the actual menu photos, used only for the matching drink.
const MENU_PHOTOS: Record<string, string> = {
  "แดงมะนาวโซดา": "/images/red-lime.png",
  "แดงมะนาว": "/images/red-lime.png",
  "redlime": "/images/red-lime.png",
  "redlimesoda": "/images/red-lime.png",
  "นมชมพู": "/images/pink-milk.png",
  "pinkmilk": "/images/pink-milk.png",
  "บลูฮาวาย": "/images/blue-hawaii.png",
  "บลูฮาวายโซดา": "/images/blue-hawaii.png",
  "bluehawaii": "/images/blue-hawaii.png",
  "โกโก้": "/images/cocoa.png",
  "โกโก้เข้ม": "/images/cocoa.png",
  "cocoa": "/images/cocoa.png",
  "ชามะลิ": "/images/jasmine-tea.png",
  "jasminetea": "/images/jasmine-tea.png",
};

export function localMenuPhoto(name: string) {
  return MENU_PHOTOS[name.trim().toLowerCase().replace(/[\s-]/g, "")];
}

export function moodDrinkName(mood: Mood) {
  return mood.drinkname?.trim() || mood.drinkName?.trim() || mood.name;
}

export function resolveOrderDrink(item: OrderItem, moods: Mood[]) {
  const mood = moods.find((entry) => entry.id === item.moodId);
  const name = item.drinkname?.trim() || item.drinkName?.trim()
    || (mood && moodDrinkName(mood)) || "ไม่พบชื่อเครื่องดื่ม";
  return { name, imageUrl: item.imageUrl || mood?.imageUrl };
}
