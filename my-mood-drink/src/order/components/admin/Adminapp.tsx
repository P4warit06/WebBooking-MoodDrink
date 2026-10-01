import { NavLink, Routes, Route, Navigate , useNavigate} from "react-router-dom";
import { LayoutGrid, ListOrdered, LogOut , Home } from "lucide-react";
import { AdminGate } from "./AdminGate";
import { Dashboard } from "./Dashboard";
import { QueueManagement } from "./QueueManagement";

const SESSION_KEY = "moodDrink:adminUnlocked";

function AdminShell() {
    const navigate = useNavigate() ; 
    const handleLogout = () => {
        localStorage.removeItem("moodDrink:adminUnlocked"); // ✅ เปลี่ยนจาก sessionStorage
        window.location.reload();
      };

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-semibold transition-all duration-200 ${
      isActive
        ? "bg-white text-neutral-900 shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.06)]"
        : "bg-transparent text-neutral-400 hover:text-neutral-600 hover:bg-white/40"
    }`;

  return (
    <div className="min-h-screen w-full bg-neutral-50">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex gap-1">
          <NavLink to="/admin/dashboard" className={tabClass}>
            <LayoutGrid size={14} /> Kitchen Display
          </NavLink>
          <NavLink to="/admin/queue" className={tabClass}>
            <ListOrdered size={14} /> Queue Management
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ ปุ่มกลับหน้าลูกค้า */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-violet-500 px-3 py-2 rounded-lg hover:bg-violet-50 transition-colors"
          >
            <Home size={12} /> หน้าลูกค้า
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={12} /> ออกจากระบบ
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