import { ArrowRight, Minus, Plus, Shuffle, Sparkles, TicketPercent, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMoods } from "../../hooks/useMood";
import type { Mood } from "../../types";
import { moodDrinkName } from "../../utils/menu";
import { DrinkImage } from "../shared/DrinkImage";
import { OrderFlowHeader } from "../shared/OrderFlowHeader";
import { MoodIcebreaker } from "./MoodIcebreaker";

interface MoodSelectionPageProps { onBack: () => void; onSelectMoods: (moods: Mood[]) => void }

export function MoodSelectionPage({ onBack, onSelectMoods }: MoodSelectionPageProps) {
  const { moods, loading } = useMoods();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedMoods = useMemo(() => selectedIds.flatMap(id => {
    const mood = moods.find(item => item.id === id);
    return mood ? [mood] : [];
  }), [selectedIds, moods]);
  const addMood = (id: string) => setSelectedIds(previous => previous.length < 3 ? [...previous, id] : previous);
  const removeMood = (id: string) => setSelectedIds(previous => previous.filter((_, index) => index !== previous.lastIndexOf(id)));

  return <main className="clay-order-page">
    <OrderFlowHeader step={1} onBack={onBack} />
    <div className="order-page-intro"><span className="eyebrow">A DRINK FOR EVERY MOOD</span><h1>วันนี้…เธอรู้สึกยังไง</h1><p>เลือกฟีลของวันนี้ แล้วค้นพบแก้วที่เข้ากับคุณ</p></div>
    <div className="clay-promo selection-promo"><TicketPercent size={24} /><span><strong>ชวนเพื่อนมาฮีลใจ · 3 แก้ว 100 บาท</strong><small>เลือกเมนูซ้ำได้ · ท็อปปิ้งคิดเพิ่ม</small></span><span className="promo-count">{selectedIds.length}/3</span></div>
    {loading && <p role="status" className="order-loading"><LoaderCircle className="animate-spin" size={22} /> กำลังเลือกความสดใสมาให้คุณ...</p>}
    {!loading && moods.length === 0 && <p className="order-clay-card order-loading">ยังไม่มีเมนูที่เปิดขายในขณะนี้</p>}
    <div className="mood-menu-grid">{moods.map(mood => {
      const count = selectedIds.filter(id => id === mood.id).length;
      return <motion.article key={mood.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`order-clay-card mood-menu-card ${count ? "selected" : ""}`}>
        <button className="mood-menu-select" onClick={() => addMood(mood.id)} disabled={selectedIds.length >= 3} aria-label={`เพิ่ม ${moodDrinkName(mood)}`}>
          <span className="mood-pill">{mood.emoji} {mood.name}</span><DrinkImage src={mood.imageUrl} name={moodDrinkName(mood)} /><h2>{moodDrinkName(mood)}</h2><p>{mood.basePrice} บาท / แก้ว</p>
        </button>
        <div className="mood-quantity"><button onClick={() => removeMood(mood.id)} disabled={count === 0} aria-label={`ลด ${moodDrinkName(mood)} หนึ่งแก้ว`}><Minus size={16} /></button><span aria-live="polite">{count ? `${count} แก้ว` : "เพิ่มแก้วนี้"}</span><button onClick={() => addMood(mood.id)} disabled={selectedIds.length >= 3} aria-label={`เพิ่ม ${moodDrinkName(mood)} อีกหนึ่งแก้ว`}><Plus size={16} /></button></div>
      </motion.article>;
    })}</div>
    <div className="mood-extras"><button className="clay-button secondary" disabled={!moods.length} onClick={() => onSelectMoods([moods[Math.floor(Math.random() * moods.length)]])}><Shuffle size={18} /> เลือกไม่ถูก? สุ่มฟีลให้ฉันที</button><details className="mood-question"><summary><Sparkles size={17} /> คำถามชวนคุยระหว่างเลือกเครื่องดื่ม</summary><MoodIcebreaker selectedMoods={selectedMoods} /></details></div>
    <div className="clay-order-footer"><div className="footer-total"><span>เลือกแก้วโปรดแล้ว</span><strong>{selectedIds.length} <small>/ 3 แก้ว</small></strong></div><button disabled={!selectedMoods.length} className="clay-button primary" onClick={() => onSelectMoods(selectedMoods)}>ปรับแก้วโปรด <ArrowRight size={19} /></button></div>
  </main>;
}
