import { Home, MapPin, User, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export type NavTab = "home" | "shop" | "me";

interface BottomNavProps {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
  onAdminClick: () => void; 
}

const TABS: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "HOME", icon: Home },
  { id: "shop", label: "SHOP", icon: MapPin },
  { id: "me", label: "ME", icon: User },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const navigate = useNavigate();

  
  const isAdminUnlocked =
    typeof window !== "undefined" &&
    localStorage.getItem("moodDrink:adminUnlocked") === "true";

  const handleAdminClick = () => {
    navigate("/admin");
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl 
                    bg-gradient-to-b from-white/70 via-white/80 to-white/90 
                    backdrop-blur-2xl backdrop-saturate-150
                    border-t-2 border-x border-white/90 
                    rounded-t-[3.5rem] 
                    shadow-[0_-12px_40px_rgba(236,72,153,0.06),inset_0_2px_4px_rgba(255,255,255,1)] 
                    px-8 pt-5 pb-6 flex justify-around items-center z-30"
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
                className="absolute inset-x-[-12px] inset-y-[-6px] rounded-2xl bg-pink-500/10 -z-10"
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
                    ? "text-[#FF80B5] fill-[#FF80B5] drop-shadow-[0_4px_10px_rgba(236,72,153,0.35)]"
                    : "text-[#FF80B5] group-hover:text-[#FF80B5]"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </motion.div>

            <motion.span
              animate={{ y: isActive ? 1 : 0 }}
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

      {/* ✅ ปุ่ม Admin / Staff */}
      <button
        onClick={handleAdminClick}
        className="group relative flex flex-col items-center justify-center min-w-[64px] 
                   outline-none select-none cursor-pointer"
        aria-label="เข้าสู่ระบบพนักงาน"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative"
        >
          {/* แสดงจุดสถานะสีเขียวถ้าปลดล็อกแล้ว */}
          {isAdminUnlocked && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm z-10" />
          )}
          <Lock
            size={24}
            className="text-neutral-400 group-hover:text-violet-500 transition-colors duration-300"
            strokeWidth={2}
          />
        </motion.div>

        <span
          className={`text-[11px] font-bold tracking-wider mt-1.5 transition-colors duration-300 ${
            isAdminUnlocked
              ? "text-emerald-500"
              : "text-neutral-400 group-hover:text-violet-500"
          }`}
        >
          {isAdminUnlocked ? "STAFF" : "STAFF"}
        </span>
      </button>
    </nav>
  );
}