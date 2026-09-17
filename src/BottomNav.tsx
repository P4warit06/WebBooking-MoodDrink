import { Home, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";

export type NavTab = "home" | "shop" | "me";

interface BottomNavProps {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}

const TABS: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "HOME", icon: Home },
  { id: "shop", label: "SHOP", icon: MapPin },
  { id: "me", label: "ME", icon: User },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl 
                    bg-gradient-to-b from-white/70 via-white/80 to-white/90 
                    backdrop-blur-2xl backdrop-saturate-150
                    border-t-2 border-x border-white/90 
                    rounded-t-[3.5rem] 
                    shadow-[0_-12px_40px_rgba(236,72,153,0.06),inset_0_2px_4px_rgba(255,255,255,1)] 
                    px-12 pt-5 pb-6 flex justify-around items-center z-30"
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
            {/* Active Highlight Capsule Background Animation */}
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-x-[-12px] inset-y-[-6px] rounded-2xl bg-pink-500/10 -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* Icon Wrapper with Bounce Animation */}
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
                    ? "text-[#FF80B5] fill-[#FF80B5] drop-shadow-[0_4px_10px_rgba(236,72,153,0.35)]"
                    : "text-[#FF80B5] group-hover:text-[#FF80B5]"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </motion.div>

            {/* Text Label with Color Transition */}
            <motion.span
              animate={{
                y: isActive ? 1 : 0,
              }}
              className={`text-[11px] font-bold tracking-wider mt-1.5 transition-colors duration-300 ${
                isActive
                  ? "text-[#FF80B5]"
                  : "text-neutral-400 group-hover:text-pink-400"
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
