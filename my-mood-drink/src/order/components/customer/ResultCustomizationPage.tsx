import { useState } from "react";
import { Check } from "lucide-react";
import { TopBar } from "../shared/TopBar";
import { StepDots } from "../shared/StepDots";
import { useAddons } from "../../hooks/useAddons";
import type { Mood, OrderDraft, SweetnessLevel } from "../../types";


const SWEETNESS_LEVELS: SweetnessLevel[] = ["50%", "ปกติ", "หวานมากพิเศษ"];

interface ResultCustomizationPageProps {
  mood: Mood;
  onBack: () => void;
  onConfirm: (draft: OrderDraft) => void;
}

export function ResultCustomizationPage({
  mood,
  onBack,
  onConfirm,
}: ResultCustomizationPageProps) {
  const addonOptions = useAddons();
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [sweetness, setSweetness] = useState<SweetnessLevel>("ปกติ");

  const toggleAddon = (id: string) =>
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  const selectedAddons = addonOptions.filter((a) => addonIds.includes(a.id));
  const total =
    mood.basePrice + selectedAddons.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar onBack={onBack} title="เครื่องดื่มของคุณ" />
      <StepDots step={1} />

      <div className="px-6 pt-2">
        <div
          className="rounded-3xl h-40 flex items-center justify-center mb-4 shadow-inner"
          style={{
            background: `linear-gradient(160deg, ${mood.colorLiquid}, ${mood.colorAccent})`,
          }}
        >
          <span className="text-6xl drop-shadow">🥤</span>
        </div>

        <div className="text-center mb-5">
          <p
            className="text-xs uppercase tracking-wide"
            style={{ color: mood.colorAccent }}
          >
            เมนูที่ใช่สำหรับคุณ
          </p>
          <h2 className="text-2xl font-bold text-neutral-800 mt-1">
            {mood.drinkName}
          </h2>
          <p className="text-sm text-neutral-500 mt-1 px-4">
            {mood.description}
          </p>
          <p className="text-lg font-semibold text-neutral-800 mt-2">
            {total} บาท
          </p>
        </div>
      </div>

      <div className="px-6 flex-1 overflow-y-auto">
        <p className="text-sm font-medium text-neutral-700 mb-2">ความหวาน</p>
        <div className="flex gap-2 mb-5">
          {SWEETNESS_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSweetness(lvl)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${
                sweetness === lvl
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-neutral-700 mb-2">
          เพิ่มท็อปปิ้ง (Add-on)
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {addonOptions.map((addon) => {
            const checked = addonIds.includes(addon.id);
            return (
              <button
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-neutral-200"
              >
                <span className="text-sm text-neutral-700">{addon.name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    +{addon.price}฿
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      checked
                        ? "bg-neutral-900 border-neutral-900"
                        : "border-neutral-300"
                    }`}
                  >
                    {checked && <Check size={12} className="text-white" />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-8 pt-2">
        <button
          onClick={() =>
            onConfirm({
              mood,
              addons: selectedAddons.map(({ id, name, price }) => ({
                id,
                name,
                price,
              })),
              sweetnessLevel: sweetness,
              total,
            })
          }
          className="w-full py-4 rounded-2xl text-white font-medium active:scale-[0.98] transition shadow-md"
          style={{ background: mood.colorAccent }}
        >
          ยืนยันออเดอร์นี้ แล้วไปกรอกข้อมูลคิว
        </button>
      </div>
    </div>
  );
}
