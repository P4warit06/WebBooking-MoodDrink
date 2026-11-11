export function formatRequestedTime(iso?: string) {
  if (!iso) return "ไม่ได้ระบุเวลา";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "เวลาไม่ถูกต้อง";
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
