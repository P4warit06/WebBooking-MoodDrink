import { useState } from "react";
import { HomePage } from "./order/components/customer/HomePage";
import { MoodSelectionPage } from "./order/components/customer/MoodSelectionPage";
import { ResultCustomizationPage } from "./order/components/customer/ResultCustomizationPage";
import { QueueCheckoutPage } from "./order/components/customer/QueueCheckoutPage";
import { ConfirmationPage } from "./order/components/customer/ConfirmationPage";
import type { Mood, OrderDraft } from "./order/types";

type Page = "home" | "mood" | "result" | "checkout" | "confirmation";

const LAST_ORDER_KEY = "moodDrink:lastOrderId";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [mood, setMood] = useState<Mood | null>(null);
  const [orderDraft, setOrderDraft] = useState<OrderDraft | null>(null);
  const [orderId, setOrderId] = useState<string | null>(
    () => localStorage.getItem(LAST_ORDER_KEY) // lets a customer reopen the tab and still see their queue
  );

  const goHome = () => {
    setPage("home");
    setMood(null);
    setOrderDraft(null);
  };

  const handleSubmitted = (id: string) => {
    localStorage.setItem(LAST_ORDER_KEY, id);
    setOrderId(id);
    setPage("confirmation");
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100 p-4">
      <div className="w-[380px] h-[720px] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-neutral-900 relative bg-gradient-to-br from-pink-50 to-violet-100">
        {page === "home" && (
          <HomePage
            onPickMood={() => setPage("mood")}
            onBookQueue={() => setPage("mood")}
          />
        )}

        {page === "mood" && (
          <MoodSelectionPage
            onBack={goHome}
            onSelectMood={(m) => {
              setMood(m);
              setPage("result");
            }}
          />
        )}

        {page === "result" && mood && (
          <ResultCustomizationPage
            mood={mood}
            onBack={() => setPage("mood")}
            onConfirm={(draft) => {
              setOrderDraft(draft);
              setPage("checkout");
            }}
          />
        )}

        {page === "checkout" && mood && orderDraft && (
          <QueueCheckoutPage
            mood={mood}
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
          />
        )}
      </div>
    </div>
  );
}
