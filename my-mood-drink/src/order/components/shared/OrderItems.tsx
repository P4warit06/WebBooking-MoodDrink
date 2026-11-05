import type { Mood, OrderItem } from "../../types";
import { resolveOrderDrink } from "../../utils/menu";
import { DrinkImage } from "./DrinkImage";

export function OrderItems({ items, moods = [] }: { items: OrderItem[]; moods?: Mood[] }) {
  return <div className="order-item-list">{items.map((item, index) => {
    const drink = resolveOrderDrink(item, moods);
    return <div key={`${item.moodId}-${index}`} className="order-item">
      <DrinkImage src={drink.imageUrl} name={drink.name} />
      <div className="order-item-copy">
        <span className="order-item-number">แก้วที่ {index + 1}</span>
        <div className="order-item-title"><h3>{drink.name}</h3><strong>{item.price ?? "—"} ฿</strong></div>
        <p>ความหวาน: {item.sweetnessLevel || "ไม่ระบุ"}</p>
        <p>ท็อปปิ้ง: {item.addons?.length ? item.addons.map(a => `${a.name} (+${a.price} ฿)`).join(", ") : "ไม่ใส่ท็อปปิ้ง"}</p>
      </div>
    </div>;
  })}</div>;
}
