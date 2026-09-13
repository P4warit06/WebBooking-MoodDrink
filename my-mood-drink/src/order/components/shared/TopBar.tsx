import { ChevronLeft } from "lucide-react";

interface TopBarProps {
  onBack?: () => void;
  title?: string;
}

export function TopBar({ onBack, title }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-2">
      {onBack ? (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/70 backdrop-blur flex items-center justify-center shadow-sm active:scale-95 transition"
        >
          <ChevronLeft size={20} className="text-neutral-700" />
        </button>
      ) : (
        <div className="w-9 h-9" />
      )}
      {title && (
        <h1 className="text-[15px] font-medium text-neutral-700">{title}</h1>
      )}
    </div>
  );
}
