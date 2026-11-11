import { useState, type FormEvent } from "react";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { ArrowRight, LoaderCircle, Upload } from "lucide-react";
import { db } from "../../../services/firebase";
import shopPaymentQr from "../../../assets/Slip MoodDrink.jpg";
import { useOrderStatus } from "../../hooks/useOrder";
import { formatRequestedTime } from "../../utils/fulfillment";

const qrUrl =
  (import.meta.env.VITE_PAYMENT_QR_URL as string | undefined) || shopPaymentQr;
const maxSlipSize = 4 * 1024 * 1024;

async function compressSlip(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, 1600 / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * ratio);
      canvas.height = Math.round(image.height * ratio);
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("ไม่สามารถย่อภาพสลิปได้"));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.8, 0.65, 0.5, 0.35]) {
        const data = canvas.toDataURL("image/jpeg", quality);
        if (data.length < 750000) return resolve(data);
      }
      reject(new Error("ภาพสลิปใหญ่เกินไป กรุณาลองใช้ภาพที่เล็กลง"));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("เปิดภาพสลิปไม่สำเร็จ"));
    };
    image.src = url;
  });
}

export function PaymentPage({
  orderId,
  onPaid,
  onHome,
}: {
  orderId: string;
  onPaid: () => void;
  onHome: () => void;
}) {
  const order = useOrderStatus(orderId);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const verified = order?.paymentStatus === "verified";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !file ||
      busy ||
      !order ||
      verified ||
      order.paymentStatus === "submitted"
    )
      return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > maxSlipSize
    ) {
      setError("กรุณาใช้ไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 4 MB");
      return;
    }
    setBusy(true);
    try {
      const imageData = await compressSlip(file);
      const batch = writeBatch(db);
      batch.set(doc(db, "paymentSlips", orderId), {
        orderId,
        imageData,
        submittedAt: serverTimestamp(),
      });
      batch.update(doc(db, "orders", orderId), {
        paymentStatus: "submitted",
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      setFile(null);
    } catch (cause) {
      console.error("Slip upload failed:", cause);
      setError(
        cause instanceof Error && cause.message.includes("ภาพสลิป")
          ? cause.message
          : "ส่งสลิปไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="clay-order-page payment-page">
      <div className="order-page-intro">
        <span className="eyebrow">PAYMENT</span>
        <h1>ชำระเงินเพื่อยืนยันคิว</h1>
        <p>โอนตามยอดที่แสดง แล้วอัปโหลดสลิปให้พนักงานตรวจสอบ</p>
      </div>
      <div className="payment-layout">
        <section className="order-clay-card payment-qr-card">
          <h2>สแกน QR เพื่อโอนเงิน</h2>
          <strong className="payment-amount">
            {order ? `${order.totalPrice} บาท` : "กำลังโหลดยอด..."}
          </strong>
          {order?.requestedAt && <p className="order-footnote">{order.fulfillmentMethod === "delivery" ? "ให้เดินไปส่ง" : "รับที่หน้าร้าน"} · {formatRequestedTime(order.requestedAt)} โดยประมาณ{order.fulfillmentMethod === "delivery" && order.deliveryLocation ? ` · ${order.deliveryLocation}` : ""}</p>}
          {qrUrl ? (
            <img
              className="payment-qr"
              src={qrUrl}
              alt="QR รับโอนเงินของร้าน Mood Drink"
            />
          ) : (
            <p role="alert" className="order-error">
              ร้านยังไม่ได้ตั้งค่า QR รับโอน กรุณาติดต่อพนักงาน
            </p>
          )}
          <p className="order-footnote">
            คิว #{order?.queueNumber ?? "—"} ·
            กรุณาตรวจชื่อบัญชีผู้รับในแอปธนาคารก่อนโอน
          </p>
        </section>
        <form className="order-clay-card payment-slip-card" onSubmit={submit}>
          <h2>อัปโหลดสลิปโอนเงิน</h2>
          <p className="order-footnote">
            รองรับ JPG, PNG, WebP ไม่เกิน 4 MB
            กรุณาใช้ภาพที่อ่านยอดและชื่อผู้รับได้ชัดเจน
          </p>
          <label className="payment-file-label" htmlFor="payment-slip">
            <Upload size={22} />
            {file ? file.name : "เลือกภาพสลิป"}
          </label>
          <input
            id="payment-slip"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            disabled={busy || verified || order?.paymentStatus === "submitted"}
          />
          {error && (
            <p role="alert" className="order-error">
              {error}
            </p>
          )}
          {order?.paymentStatus === "rejected" && (
            <p role="alert" className="order-error">
              {order.paymentMessage || "สลิปไม่ผ่านการตรวจสอบ กรุณาลองอีกครั้ง"}
            </p>
          )}
          {verified ? (
            <p role="status" className="payment-success">
              พนักงานตรวจสลิปและยืนยันคิวแล้ว
            </p>
          ) : order?.paymentStatus === "submitted" ? (
            <button className="payment-pending-button" type="button" disabled aria-busy="true">
              <LoaderCircle size={18} className="animate-spin" /> ส่งสลิปแล้ว · กำลังตรวจสอบ
            </button>
          ) : (
            <button
              className="clay-button primary"
              type="submit"
              disabled={!file || busy || !order}
            >
              {busy ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />{" "}
                  กำลังอัปโหลดสลิป...
                </>
              ) : (
                <>
                  <Upload size={18} /> ส่งสลิปให้พนักงาน
                </>
              )}
            </button>
          )}
          {verified && (
            <button
              className="clay-button primary"
              type="button"
              onClick={onPaid}
            >
              ดูสถานะคิว <ArrowRight size={18} />
            </button>
          )}
          <button className="order-home-link" type="button" onClick={onHome}>
            กลับหน้าหลัก
          </button>
        </form>
      </div>
    </main>
  );
}
