import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HomePage } from "./order/components/customer/HomePage";
import { MoodSelectionPage } from "./order/components/customer/MoodSelectionPage";
import { ResultCustomizationPage } from "./order/components/customer/ResultCustomizationPage";
import { QueueCheckoutPage } from "./order/components/customer/QueueCheckoutPage";
import { ConfirmationPage } from "./order/components/customer/ConfirmationPage";
import { FeedbackPage } from "./order/components/customer/FeedbackPage";
import { BottomNav, type NavTab } from "./BottomNav";
import type { Mood, OrderDraft } from "./order/types";
type Page = "home" | "mood" | "result" | "checkout" | "confirmation" | "feedback";

const LAST_ORDER_KEY = "moodDrink:lastOrderId";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
  const [orderDraft, setOrderDraft] = useState<OrderDraft | null>(null);
  const [orderId, setOrderId] = useState<string | null>(() =>
    localStorage.getItem(LAST_ORDER_KEY)
  );

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [page]);

  const goHome = () => {
    setPage("home");
    setSelectedMoods([]);
    setOrderDraft(null);
  };

  const handleSubmitted = (id: string) => {
    localStorage.setItem(LAST_ORDER_KEY, id);
    setOrderId(id);
    setPage("confirmation");
  };

  const showBottomNav = page === "home";

  const handleNavigate = (tab: NavTab) => {
    if (tab === "home") goHome();
  };

  return (
    <div
      className="min-h-screen w-full transition-colors duration-500 animate-gradient-bg"
      style={{
        background:
          "linear-gradient(135deg, #fff8f2, #fcebed, #f3edf8)",
        backgroundSize: "400% 400%",
      }}
    >
      <div className={`mx-auto w-full ${page === "feedback" ? "max-w-2xl" : "max-w-5xl"} min-h-screen flex flex-col relative`}>
        <div className={`flex-1 flex flex-col ${showBottomNav ? "pb-24" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {page === "home" && (
                <HomePage
                  onPickMood={() => setPage("mood")}
                  onBookQueue={() => setPage("mood")}
                  onFeedback={() => setPage("feedback")}
                />
              )}

              {page === "mood" && (
                <MoodSelectionPage
                  onBack={goHome}
                  onSelectMoods={(moods) => {
                    setOrderDraft(null);
                    setSelectedMoods(moods);
                    setPage("result");
                  }}
                />
              )}

              {page === "result" && selectedMoods.length > 0 && (
                <ResultCustomizationPage
                  moods={selectedMoods}
                  initialDraft={orderDraft}
                  onBack={() => setPage("mood")}
                  onConfirm={(draft) => {
                    setOrderDraft(draft);
                    setPage("checkout");
                  }}
                />
              )}

              {page === "checkout" && selectedMoods.length > 0 && orderDraft && (
                <QueueCheckoutPage
                  moods={selectedMoods}
                  orderDraft={orderDraft}
                  onBack={() => setPage("result")}
                  onSubmitted={handleSubmitted}
                />
              )}

              {page === "confirmation" && orderId && (
                <ConfirmationPage
                  orderId={orderId}
                  onAddAnother={() => setPage("mood")}
                  onHome={goHome}
                  onFeedback={() => setPage("feedback")}
                />
              )}

              {page === "feedback" && (
                <FeedbackPage
                  onBack={goHome}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {showBottomNav && (
          <BottomNav
            active="home"
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
}
