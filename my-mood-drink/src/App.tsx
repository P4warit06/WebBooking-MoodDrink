import { useState } from "react";
import { HomePage } from "./order/components/customer/HomePage";
import { MoodSelectionPage } from "./order/components/customer/MoodSelectionPage";
import { ResultCustomizationPage } from "./order/components/customer/ResultCustomizationPage";
import { QueueCheckoutPage } from "./order/components/customer/QueueCheckoutPage";
import { ConfirmationPage } from "./order/components/customer/ConfirmationPage";
import { BottomNav, type NavTab } from "./Bottomnav";
import type { Mood, OrderDraft } from "./order/types";

type Page = "home" | "mood" | "result" | "checkout" | "confirmation";

const LAST_ORDER_KEY = "moodDrink:lastOrderId";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [mood, setMood] = useState<Mood | null>(null);
  const [orderDraft, setOrderDraft] = useState<OrderDraft | null>(null);
  const [orderId, setOrderId] = useState<string | null>(() =>
    localStorage.getItem(LAST_ORDER_KEY)
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

  // The tab bar is a "browse" affordance — once someone is mid-order
  // (mood → confirmation) the TopBar back-arrow flow takes over instead,
  // same as the mockup only showing it on the landing screen.
  const showBottomNav = page === "home";

  const handleNavigate = (tab: NavTab) => {
    if (tab === "home") goHome();
    // "shop" / "me" have no screens yet — wire these up once those exist.
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(165deg, #f6b9d2 0%, #dcb2ec 45%, #b6c6f3 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-xl min-h-screen flex flex-col relative">
        <div className={`flex-1 flex flex-col ${showBottomNav ? "pb-24" : ""}`}>
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

        {showBottomNav && (
          <BottomNav active="home" onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}
