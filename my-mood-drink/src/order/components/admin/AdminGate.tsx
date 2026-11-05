import { useEffect, useState, type ReactNode } from "react";
import { LockKeyhole, LogIn, ShieldAlert, LoaderCircle } from "lucide-react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../services/firebase";

type GateState = "checking" | "signed-out" | "checking-role" | "denied" | "allowed";
type StaffRole = "staff" | "admin";

async function getStaffRole(user: User): Promise<StaffRole | null> {
  const profile = await getDoc(doc(db, "users", user.uid));
  const role = profile.data()?.role;
  return role === "staff" || role === "admin" ? role : null;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setState((current) => current === "denied" ? "denied" : "signed-out");
      return;
    }

    setState("checking-role");
    try {
      const role = await getStaffRole(user);
      if (role) {
        setState("allowed");
      } else {
        await signOut(auth);
        setState("denied");
      }
    } catch (cause) {
      console.error("Unable to check staff role:", cause);
      await signOut(auth);
      setError("ตรวจสอบสิทธิ์พนักงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setState("signed-out");
    }
  }), []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (cause) {
      console.error("Staff sign-in failed:", cause);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setSubmitting(false);
    }
  };

  if (state === "allowed") return <>{children}</>;

  const checking = state === "checking" || state === "checking-role";
  return (
    <main className="staff-gate">
      <section className="staff-gate-card" aria-busy={checking}>
        <span className="staff-gate-mark">
          {checking ? <LoaderCircle className="animate-spin" size={25} /> : state === "denied" ? <ShieldAlert size={25} /> : <LockKeyhole size={25} />}
        </span>
        <p className="staff-gate-eyebrow">MOOD DRINK · STAFF PORTAL</p>
        <h1>{checking ? "กำลังตรวจสอบสิทธิ์" : state === "denied" ? "บัญชีนี้ไม่มีสิทธิ์พนักงาน" : "เข้าสู่ระบบพนักงาน"}</h1>
        <p className="staff-gate-copy">
          {checking ? "โปรดรอสักครู่" : state === "denied" ? "ติดต่อผู้ดูแลระบบเพื่อเพิ่ม role staff หรือ admin ให้บัญชีนี้" : "ใช้บัญชีพนักงานที่ได้รับอนุญาตเท่านั้น"}
        </p>
        {!checking && state !== "denied" && (
          <form onSubmit={handleSubmit} className="staff-login-form">
            <label htmlFor="staff-email">อีเมลพนักงาน</label>
            <input id="staff-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="staff@mooddrink.com" required disabled={submitting} />
            <label htmlFor="staff-password">รหัสผ่าน</label>
            <input id="staff-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="รหัสผ่าน" required disabled={submitting} />
            {error && <p role="alert" className="staff-login-error">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? <><LoaderCircle className="animate-spin" size={18} /> กำลังเข้าสู่ระบบ...</> : <><LogIn size={18} /> เข้าสู่ Staff Portal</>}
            </button>
          </form>
        )}
        {state === "denied" && <button type="button" className="staff-gate-back" onClick={() => setState("signed-out")}>กลับไปเข้าสู่ระบบอีกครั้ง</button>}
      </section>
    </main>
  );
}
