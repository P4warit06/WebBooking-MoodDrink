import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LayoutGrid, ListOrdered, LogOut, Home } from "lucide-react";
import { AdminGate } from "./AdminGate";
import { Dashboard } from "./Dashboard";
import { QueueManagement } from "./QueueManagement";

const SESSION_KEY = "moodDrink:adminUnlocked";

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

function AdminShell() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
  };

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-5 min-h-11 rounded-t-xl text-sm font-semibold transition-all duration-200 ${focusRing} ${
      isActive
        ? "bg-white text-violet-700 shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.06)]"
        : "text-neutral-500 hover:text-neutral-800 hover:bg-white/60"
    }`;

  const utilClass = `flex items-center gap-1.5 text-xs text-neutral-500 px-3 min-h-11 rounded-lg transition-colors ${focusRing}`;

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc]">
      <div className="flex items-end justify-between px-4 md:px-8 pt-3 bg-white/40">
        <nav aria-label="Admin" className="flex gap-1">
          <NavLink to="/admin/dashboard" className={tabClass}>
            <LayoutGrid size={16} /> Kitchen Display
          </NavLink>
          <NavLink to="/admin/queue" className={tabClass}>
            <ListOrdered size={16} /> Queue Management
          </NavLink>
        </nav>

        <div className="flex items-center gap-1 pb-1">
          <button onClick={() => navigate("/")} className={`${utilClass} hover:text-violet-700 hover:bg-violet-50`}>
            <Home size={14} /> หน้าลูกค้า
          </button>
          <button onClick={handleLogout} className={`${utilClass} hover:text-red-600 hover:bg-red-50`}>
            <LogOut size={14} /> ออกจากระบบ
          </button>
        </div>
      </div>

      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="queue" element={<QueueManagement />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminGate>
      <AdminShell />
    </AdminGate>
  );
}