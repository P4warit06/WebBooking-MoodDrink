import { ArrowRight, MessageCircleHeart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HomePageProps {
  onPickMood: () => void;
  onBookQueue: () => void;
  onFeedback: () => void;
}

export function HomePage({ onPickMood, onFeedback }: HomePageProps) {
  return (
    <main className="home-page">
      <header className="home-header"><div className="brand-mark">m<span>.</span></div><div><strong>Mood Drink</strong><small>DRINK YOUR MOOD</small></div><span className="header-sparkle"><Sparkles size={19} /></span></header>
      <motion.section className="home-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
        <div className="hero-copy"><span className="eyebrow">A LITTLE SIP OF HAPPINESS ✦</span><h1>วันนี้รู้สึกแบบไหน<br /><em>ให้เราเติมความสดใส</em></h1><p>ไม่ว่าวันนี้จะเป็นวันแบบไหน ก็มีเครื่องดื่มที่เข้าใจคุณเสมอ</p><button className="primary-action" onClick={onPickMood}>ค้นหาเครื่องดื่มที่ใช่ <ArrowRight size={19} /></button></div>
        <div className="hero-art"><span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><img src="/images/pink-milk.png" alt="เครื่องดื่มสีพาสเทล Mood Drink" /><span className="art-note">made for<br /><b>your mood ♡</b></span></div>
      </motion.section>
      <section className="home-bottom"><div className="home-intro"><span className="eyebrow">HOW IT WORKS</span><h2>แก้วโปรดเริ่มจากความรู้สึก</h2><p>เลือกอารมณ์ ปรับรสชาติในแบบของคุณ แล้วรับคิวได้เลย · 3 แก้ว 100 บาท (ท็อปปิ้งคิดเพิ่ม)</p><div className="steps"><span><b>01</b> เลือกอารมณ์</span><span><b>02</b> ปรับแก้วโปรด</span><span><b>03</b> รับคิว</span></div></div><button className="feedback-link" onClick={onFeedback}><span className="feedback-icon"><MessageCircleHeart size={25} /></span><span><small>WE'D LOVE TO HEAR FROM YOU</small><strong>บอกความรู้สึกกับเรา</strong><span>แบ่งปันความคิดเห็นของคุณ</span></span><ArrowRight className="feedback-arrow" size={20} /></button></section>
      <footer className="home-footer">MADE WITH ♡ FOR EVERY MOOD <span>MOOD DRINK</span></footer>
    </main>
  );
}
