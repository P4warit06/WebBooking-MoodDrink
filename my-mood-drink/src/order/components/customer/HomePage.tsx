import { ArrowRight, MessageCircleHeart, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const instagramUrl =
  import.meta.env.VITE_INSTAGRAM_URL ||
  "https://www.instagram.com/mooddrinkslnwza/";

interface HomePageProps {
  onPickMood: () => void;
  onBookQueue: () => void;
  onFeedback: () => void;
}

export function HomePage({ onPickMood, onFeedback }: HomePageProps) {
  const reduceMotion = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? (false as const) : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.5,
      delay: reduceMotion ? 0 : delay,
    },
  });
  const buttonMotion = {
    whileHover: reduceMotion ? undefined : { y: -3, scale: 1.02 },
    whileTap: reduceMotion ? undefined : { scale: 0.97 },
    transition: { type: "spring" as const, stiffness: 350, damping: 24 },
  };

  return (
    <main className="home-page">
      <motion.header className="home-header" {...reveal()}>
        <div className="brand-mark">
          m<span>.</span>
        </div>
        <div>
          <strong>Mood Drink</strong>
          <small>DRINK YOUR MOOD</small>
        </div>
        <span className="header-sparkle">
          <Sparkles size={19} />
        </span>
      </motion.header>
      <motion.section className="home-hero" {...reveal(0.08)}>
        <div className="hero-copy">
          <span className="eyebrow">A LITTLE SIP OF HAPPINESS ✦</span>
          <motion.h1 {...reveal(0.18)}>
            วันนี้รู้สึกแบบไหน
            <br />
            <em>ให้เราเติมความสดใส</em>
          </motion.h1>
          <p>ไม่ว่าวันนี้จะเป็นวันแบบไหน ก็มีเครื่องดื่มที่เข้าใจคุณเสมอ</p>
          <motion.button
            className="primary-action"
            onClick={onPickMood}
            {...buttonMotion}
          >
            ค้นหาเครื่องดื่มที่ใช่ <ArrowRight size={19} />
          </motion.button>
        </div>
        <div className="hero-art">
          <motion.span
            className="art-orbit orbit-one"
            aria-hidden="true"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }
            }
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.span
            className="art-orbit orbit-two"
            aria-hidden="true"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.04, 1], opacity: [1, 0.5, 1] }
            }
            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.img
            src="/images/pink-milk.png"
            alt="เครื่องดื่มสีพาสเทล Mood Drink"
            animate={
              reduceMotion ? undefined : { y: [0, -12, 0], rotate: [0, -2, 0] }
            }
            transition={{
              y: { duration: 5, ease: "easeInOut", repeat: Infinity },
              rotate: { duration: 5, ease: "easeInOut", repeat: Infinity },
              scale: { duration: 0.25 },
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          />
          <motion.span
            className="art-note"
            animate={
              reduceMotion ? undefined : { rotate: [8, 3, 8], y: [0, -6, 0] }
            }
            transition={{ duration: 6.5, ease: "easeInOut", repeat: Infinity }}
          >
            made for
            <br />
            <b>your mood ♡</b>
          </motion.span>
        </div>
      </motion.section>
      <motion.section
        className="home-bottom"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
      >
        <div className="home-intro">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>แก้วโปรดเริ่มจากความรู้สึก</h2>
          <p>
            เลือกอารมณ์ที่ใช่ ปรับรสชาติที่ชอบ
            แล้วรอรับเครื่องดื่มแก้วโปรดของคุณได้เลย ✨<br></br>
            <h3>
              <b>Promotion: 3 แก้ว เพียง 100.- (ไม่รวมค่าท็อปปิ้ง)</b>
            </h3>
          </p>
          <div className="steps">
            <span>
              <b>01</b> เลือกอารมณ์
            </span>
            <span>
              <b>02</b> ปรับแก้วโปรด
            </span>
            <span>
              <b>03</b> รับคิว
            </span>
          </div>
        </div>
        <motion.button
          className="feedback-link"
          onClick={onFeedback}
          {...buttonMotion}
        >
          <span className="feedback-icon">
            <MessageCircleHeart size={25} />
          </span>
          <span>
            <small>WE'D LOVE TO HEAR FROM YOU</small>
            <strong>บอกความรู้สึกกับเรา</strong>
            <span>แบ่งปันความคิดเห็นของคุณ</span>
          </span>
          <ArrowRight className="feedback-arrow" size={20} />
        </motion.button>
      </motion.section>
      <footer className="home-footer">
        <span>MADE WITH ♡ FOR EVERY MOOD</span>
        <a
          className="instagram-link"
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="ติดตาม Mood Drink บน Instagram"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle cx="17.5" cy="6.8" r="1.1" fill="currentColor" />
          </svg>
          <span>Instagram</span>
        </a>
      </footer>
    </main>
  );
}
