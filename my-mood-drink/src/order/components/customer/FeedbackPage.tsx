import { useState } from "react";
import { TopBar } from "../shared/TopBar";
import { db } from "../../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Star, Send, CheckCircle2 } from "lucide-react";

interface FeedbackPageProps {
  onBack: () => void;
}

interface FeedbackData {
  priceValue: number;
  serviceValue: number;
  experienceValue: number;
  comment: string;
}

export function FeedbackPage({ onBack }: FeedbackPageProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    priceValue: 0,
    serviceValue: 0,
    experienceValue: 0,
    comment: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (field: keyof FeedbackData, value: number) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (feedback.priceValue === 0 || feedback.serviceValue === 0 || feedback.experienceValue === 0) {
      alert("กรุณาให้คะแนนความพึงพอใจให้ครบทุกหัวข้อ");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        ...feedback,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-pastel-pink/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-baby-blue/40 blur-3xl" />
        </div>
        <div className="relative z-10 glass-panel p-8 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-bold text-text-main font-display">ขอบคุณสำหรับคำติชม!</h2>
          <p className="text-text-secondary font-display">
            ความคิดเห็นของคุณช่วยให้เราพัฒนา Mood Drink ให้ดียิ่งขึ้น
          </p>
          <button
            onClick={onBack}
            className="mt-4 w-full py-3 rounded-full bg-gradient-to-br from-pastel-pink to-soft-purple text-white font-bold font-display shadow-lg"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page flex-1 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 w-64 h-64 rounded-full bg-pastel-pink/40 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-violet-300/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-sky-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center px-2">
        <TopBar onBack={onBack} />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-medium text-text-main font-display tracking-wide pointer-events-none">
          บอกความรู้สึกของคุณ
        </h1>
      </div>

      <div className="relative z-10 px-6 pt-4 flex-1 overflow-y-auto pb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-main font-display">ความพึงพอใจ</h2>
          <p className="text-sm text-text-secondary font-display mt-1">ความเห็นของคุณมีค่าสำหรับเรา</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Rating Item */}
          {[
            { key: "priceValue", label: "ราคาต่อปริมาณ", sub: "คุ้มค่าและเหมาะสม" },
            { key: "serviceValue", label: "การให้บริการ", sub: "ความรวดเร็วและเป็นกันเอง" },
            { key: "experienceValue", label: "ประสบการณ์แปลกใหม่", sub: "ความว้าวของเครื่องดื่ม" },
          ].map((item) => (
            <div key={item.key} className="clay-card p-5">
              <div className="flex flex-col items-center gap-3">
                <div className="text-center">
                  <h3 className="font-bold text-text-main font-display">{item.label}</h3>
                  <p className="text-xs text-text-secondary font-display">{item.sub}</p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(item.key as keyof FeedbackData, star)}
                      aria-label={`${item.label} ${star} ดาว`}
                      aria-pressed={Number(feedback[item.key as keyof FeedbackData]) === star}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          Number(feedback[item.key as keyof FeedbackData]) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-rose-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Comment box */}
          <div className="clay-card p-5">
            <p className="text-sm font-bold text-text-main mb-3 font-display">ข้อเสนอแนะเพิ่มเติม</p>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="เขียนบอกเราได้เลย..."
              className="clay-input w-full h-32 p-4 rounded-2xl transition font-kanit text-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="relative z-10 w-full mt-8 py-4 rounded-full text-white font-bold
                     bg-gradient-to-br from-rose-400 to-rose-500 shadow-lg
                     flex items-center justify-center gap-3 transition-all active:scale-95
                     disabled:opacity-50 font-display text-lg"
        >
          {submitting ? "กำลังส่ง..." : (
            <>
              <Send size={20} />
              ส่งความคิดเห็น
            </>
          )}
        </button>
      </div>
    </div>
  );
}
