import { ArrowLeft, Check } from "lucide-react";

export function OrderFlowHeader({ step, onBack }: { step: number; onBack?: () => void }) {
  return <header className="order-flow-header">
    <div className="order-flow-brand">
      {onBack ? <button className="clay-icon-button" onClick={onBack} aria-label="ย้อนกลับ"><ArrowLeft size={20} /></button> : <span className="order-brand-dot">m.</span>}
      <span>Mood Drink<small>A LITTLE SIP OF HAPPINESS</small></span>
      <span className="order-step-count">{step === 4 ? "YOUR QUEUE" : `STEP 0${step}`}</span>
    </div>
    <ol className="order-steps" aria-label="ขั้นตอนการสั่งซื้อ">
      {["เลือกอารมณ์", "ปรับแก้วโปรด", "ยืนยันออเดอร์"].map((label, index) => <li key={label} className={step > index + 1 ? "done" : step === index + 1 ? "current" : ""} aria-current={step === index + 1 ? "step" : undefined}>
        <span>{step > index + 1 ? <Check size={13} /> : index + 1}</span>{label}
      </li>)}
    </ol>
  </header>;
}
