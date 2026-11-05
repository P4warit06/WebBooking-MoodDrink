import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, LoaderCircle, Plus, Sparkles } from "lucide-react";
import { useAddons } from "../../hooks/useAddons";
import { calculatePricing } from "../../utils/pricing";
import { moodDrinkName } from "../../utils/menu";
import { DrinkImage } from "../shared/DrinkImage";
import { OrderFlowHeader } from "../shared/OrderFlowHeader";
import type { Mood, OrderDraft, SweetnessLevel } from "../../types";

const SWEETNESS_LEVELS: SweetnessLevel[] = ["50%", "ปกติ", "หวานมากพิเศษ"];
interface ResultCustomizationPageProps {
  moods: Mood[];
  initialDraft?: OrderDraft | null;
  onBack: () => void;
  onConfirm: (draft: OrderDraft) => void;
}
type DrinkCustomization = { addonIds: string[]; sweetness: SweetnessLevel };

export function ResultCustomizationPage({ moods, initialDraft, onBack, onConfirm }: ResultCustomizationPageProps) {
  const { addons: addonOptions, loading, error } = useAddons();
  const [activeIndex, setActiveIndex] = useState(0);
  const [customizations, setCustomizations] = useState<DrinkCustomization[]>(() => moods.map((mood, index) => {
    const saved = initialDraft?.items[index];
    return saved?.mood.id === mood.id ? { addonIds: saved.addons.map(a => a.id), sweetness: saved.sweetnessLevel } : { addonIds: [], sweetness: "ปกติ" };
  }));
  const currentMood = moods[activeIndex];
  const currentCust = customizations[activeIndex];
  const toggleAddon = (id: string) => setCustomizations(previous => previous.map((item, index) => index === activeIndex ? {
    ...item, addonIds: item.addonIds.includes(id) ? item.addonIds.filter(value => value !== id) : [...item.addonIds, id],
  } : item));
  const setSweetness = (sweetness: SweetnessLevel) => setCustomizations(previous => previous.map((item, index) => index === activeIndex ? { ...item, sweetness } : item));
  const items = moods.map((mood, index) => {
    const addons = addonOptions.filter(addon => customizations[index].addonIds.includes(addon.id)).map(({ id, name, price }) => ({ id, name, price }));
    return { mood, addons, sweetnessLevel: customizations[index].sweetness, total: mood.basePrice + addons.reduce((sum, addon) => sum + addon.price, 0) };
  });
  const draft: OrderDraft = { items, ...calculatePricing(items) };

  return <main className="clay-order-page">
    <OrderFlowHeader step={2} onBack={onBack} />
    <div className="order-page-intro"><span className="eyebrow">MAKE IT YOURS</span><h1>แก้วนี้…ในแบบของคุณ</h1><p>เลือกความหวาน เติมท็อปปิ้ง แล้วให้เราดูแลความสดชื่น</p></div>
    <div className="clay-drink-tabs" role="group" aria-label="เลือกแก้วที่ต้องการปรับแต่ง">{moods.map((mood, index) => <button key={`${mood.id}-${index}`} onClick={() => setActiveIndex(index)} className={activeIndex === index ? "selected" : ""} aria-pressed={activeIndex === index}><span>{index + 1}</span><div>แก้วที่ {index + 1}<small>{moodDrinkName(mood)}</small></div></button>)}</div>
    <div className="customization-layout">
      <motion.section key={activeIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }} className="order-clay-card featured-drink">
        <span className="featured-label"><Sparkles size={14} /> YOUR PERFECT MATCH</span>
        <DrinkImage src={currentMood.imageUrl} name={moodDrinkName(currentMood)} className="featured-drink-image" eager />
        <span className="mood-pill">{currentMood.emoji} {currentMood.name}</span>
        <h2>{moodDrinkName(currentMood)}</h2><p>{currentMood.description}</p>
        <div className="featured-price"><span>ราคาแก้วนี้{moods.length === 3 ? "ก่อนโปรโมชั่น" : ""}</span><strong>{items[activeIndex].total} <small>บาท</small></strong></div>
      </motion.section>
      <div className="customization-options">
        <section className="order-clay-card"><div className="clay-section-heading"><span className="clay-section-icon peach">01</span><div><h2>หวานแค่ไหนกำลังดี</h2><p>ปรับความหวานสำหรับแก้วนี้</p></div></div><div className="clay-choice-group">{SWEETNESS_LEVELS.map(level => <button key={level} className={currentCust.sweetness === level ? "selected" : ""} onClick={() => setSweetness(level)} aria-pressed={currentCust.sweetness === level}>{level === "50%" ? "หวานน้อย 50%" : level}</button>)}</div></section>
        <section className="order-clay-card"><div className="clay-section-heading"><span className="clay-section-icon">02</span><div><h2>เติมความสนุกให้แก้วโปรด</h2><p>ท็อปปิ้งเลือกเพิ่มได้ตามใจ</p></div><span className="clay-count">{currentCust.addonIds.length}</span></div>
          {loading && <p role="status" className="flex items-center gap-2 order-footnote"><LoaderCircle size={16} className="animate-spin" /> กำลังโหลดท็อปปิ้ง...</p>}
          {error && <p role="alert" className="order-error">{error}</p>}
          <div className="clay-addon-list">{addonOptions.length ? addonOptions.map(addon => {
            const selected = currentCust.addonIds.includes(addon.id);
            return <button key={addon.id} onClick={() => toggleAddon(addon.id)} className={`clay-addon ${selected ? "selected" : ""}`} aria-pressed={selected}>
              {addon.imageUrl ? <DrinkImage src={addon.imageUrl} name={addon.name} /> : <span className="addon-letter" aria-hidden="true">{addon.name.slice(0,1)}</span>}
              <span className="addon-copy"><strong>{addon.name}</strong><small>+ {addon.price} บาท</small></span><span className="addon-check">{selected ? <Check size={16} /> : <Plus size={16} />}</span>
            </button>;
          }) : !loading && !error && <p className="order-footnote">ยังไม่มีท็อปปิ้งให้เลือก</p>}</div>
        </section>
      </div>
    </div>
    <div className="clay-order-footer"><div className="footer-total"><span>{moods.length} แก้ว · รวมท็อปปิ้ง</span><strong>{loading || error ? "—" : draft.grandTotal} <small>บาท</small></strong></div><button className="clay-button primary" disabled={loading || !!error} onClick={() => onConfirm(draft)}>สรุปออเดอร์ <ArrowRight size={19} /></button>{moods.length === 3 && <p className="footer-promo">ใช้โปร 3 แก้ว 100 บาท + ค่าท็อปปิ้งแล้ว</p>}</div>
  </main>;
}
