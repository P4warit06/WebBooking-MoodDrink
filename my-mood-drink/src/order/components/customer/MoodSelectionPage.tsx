import { TopBar } from "../shared/TopBar";
import { StepDots } from "../shared/StepDots";
import { useMoods } from "../../hooks/useMood";
import type { Mood } from "../../types";

interface MoodSelectionPageProps {
  onBack: () => void;
  onSelectMood: (mood: Mood) => void;
}

export function MoodSelectionPage({
  onBack,
  onSelectMood,
}: MoodSelectionPageProps) {
  const { moods, loading } = useMoods();

  const pickRandom = () => {
    if (moods.length === 0) return;
    onSelectMood(moods[Math.floor(Math.random() * moods.length)]);
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar onBack={onBack} />
      <StepDots step={0} />
      <div className="px-6 pt-2 pb-4 text-center">
        <h2 className="text-xl font-semibold text-neutral-800 leading-snug">
          วันนี้... เธอรู้สึกยังไง
          <br />
          ให้ Mood Drink จัดให้?
        </h2>
      </div>

      <div className="px-6 grid grid-cols-2 gap-3 flex-1 overflow-y-auto pb-4">
        {loading && (
          <p className="col-span-2 text-center text-sm text-neutral-400 pt-10">
            กำลังโหลด...
          </p>
        )}
        {!loading &&
          moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood)}
              className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center shadow-sm active:scale-95 transition"
              style={{
                background: `linear-gradient(160deg, ${mood.colorAccent}25, ${mood.colorAccent}55)`,
              }}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs font-medium text-neutral-800 leading-tight">
                {mood.name}
              </span>
            </button>
          ))}
      </div>

      <div className="px-6 pb-8 pt-2">
        <button
          onClick={pickRandom}
          className="w-full py-3.5 rounded-2xl bg-white border border-neutral-200 text-neutral-700 font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          🎲 สุ่มฟีลให้ฉันที!
        </button>
      </div>
    </div>
  );
}
