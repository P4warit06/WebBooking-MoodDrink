import { Home } from "lucide-react";
import { motion } from "framer-motion";

export type NavTab = "home" | "shop" | "me";

interface BottomNavProps {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}

const TABS: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "HOME", icon: Home },
];

export function BottomNav({
  active,
  onNavigate,
}: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm
                    bg-white/60 backdrop-blur-2xl backdrop-saturate-150
                    border-t border-white/80
                    rounded-t-[2rem]
                    shadow-[0_-12px_40px_rgba(236,72,153,0.06),inset_0_2px_4px_rgba(255,255,255,1)]
                    px-8 pt-3 pb-4 flex justify-around items-center z-30"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="group relative flex flex-col items-center justify-center min-w-[64px]
                       outline-none select-none cursor-pointer"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-x-[-12px] inset-y-[-6px] rounded-2xl bg-pastel-pink/20 -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <motion.div
              animate={{
                scale: isActive ? 1.15 : 1,
                y: isActive ? -2 : 0,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative"
            >
              <Icon
                size={26}
                className={`transition-colors duration-300 ${
                  isActive
                    ? "text-pastel-pink fill-pastel-pink drop-shadow-[0_4px_10px_rgba(248,200,220,0.5)]"
                    : "text-text-secondary group-hover:text-pastel-pink"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </motion.div>

            <motion.span
              animate={{ y: isActive ? 1 : 0 }}
              className={`text-[11px] font-bold tracking-wider mt-1.5 transition-colors duration-300 ${
                isActive
                  ? "text-pastel-pink"
                  : "text-text-secondary group-hover:text-pastel-pink"
              }`}
            >
              {label}
            </motion.span>
          </button>
        );
      })}
    </nav>
  );
}
