import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { ICEBREAKER_QUESTIONS, type MoodKey } from "../../data/icebreakers";

interface MoodIcebreakerProps {
  selectedMoods: { id: string }[]; // Using any for now, will refine with Mood type
}

export function MoodIcebreaker({ selectedMoods }: MoodIcebreakerProps) {
  const [questionOffset, setQuestionOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = useMemo(() => {
    let availableQuestions = ICEBREAKER_QUESTIONS;

    if (selectedMoods.length > 0) {
      const activeMoods = selectedMoods.map(m => (m.id as MoodKey));
      availableQuestions = ICEBREAKER_QUESTIONS.filter(q =>
        q.moods.some(mood => activeMoods.includes(mood))
      );
    }

    // Fallback if no mood-specific questions found
    const finalPool = availableQuestions.length > 0 ? availableQuestions : ICEBREAKER_QUESTIONS;
    const moodSeed = selectedMoods.reduce((sum, mood) => sum + [...mood.id].reduce((total, char) => total + char.charCodeAt(0), 0), 0);
    return finalPool[(moodSeed + questionOffset) % finalPool.length].question;
  }, [questionOffset, selectedMoods]);

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setQuestionOffset((current) => current + 1);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="relative z-10 px-6 mb-6">
      <div className="glass-panel p-6 overflow-hidden group relative border-pastel-pink/50">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pastel-pink/20 blur-3xl group-hover:bg-pastel-pink/40 transition-all duration-500" />

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-pastel-pink/80 flex items-center justify-center shadow-sm">
            <Sparkles size={12} className="text-text-main" />
          </div>
          <span className="text-[11px] font-bold text-pastel-pink tracking-widest uppercase">Mood Icebreaker</span>
        </div>

        <div className="relative min-h-[60px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-base font-medium text-text-main font-kanit leading-relaxed"
            >
              {currentQuestion}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleRefresh}
            disabled={isAnimating}
            className="p-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-text-secondary hover:text-pastel-pink active:scale-90 transition-all duration-200"
            aria-label="สุ่มคำถามใหม่"
          >
            <RefreshCw size={16} className={`${isAnimating ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
