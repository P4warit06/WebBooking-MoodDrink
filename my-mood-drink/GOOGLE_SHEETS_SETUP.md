# เชื่อมออเดอร์ MoodDrink กับ Google Sheet

ลิงก์ชีตที่กำหนดไว้:

`https://docs.google.com/spreadsheets/d/1Zx8scOAJsFASctsl6zbABvXW6_VOhqoo6X17MkmLX10/edit?gid=1297739659#gid=1297739659`

ในไฟล์นี้มีแท็บเดิม `การตอบแบบฟอร์ม 1` สำหรับข้อมูลจาก Google Forms และแท็บใหม่ `เว็บออเดอร์` สำหรับข้อมูลจากเว็บไซต์ โดยฝั่งเว็บจะส่งข้อมูลออเดอร์และการชำระเงินไปยัง Google Apps Script แบบ **ไม่บล็อกการสั่งซื้อ** และจะอัปเดตแถวเดิมด้วย `รหัสออเดอร์` จึงไม่สร้างข้อมูลซ้ำเมื่อลูกค้าอัปโหลดสลิปหรือพนักงานเปลี่ยนสถานะ

## ตั้งค่า Google Apps Script (ทำครั้งเดียว)

1. เปิดชีต แล้วไปที่ **Extensions → Apps Script**
2. ลบโค้ดเดิม แล้วคัดลอกโค้ดจาก `google-apps-script/Code.gs` ไปวาง
3. กด **Deploy → New deployment → Web app**
4. ตั้งค่า **Execute as: Me** และ **Who has access: Anyone**
5. กด Deploy แล้วคัดลอก **Web app URL**
6. ใส่ URL ลงในไฟล์ `.env` ของเว็บ:

```env
VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/ใส่_DEPLOYMENT_ID/exec
```

7. รีสตาร์ต Vite/สร้าง production build ใหม่

หากยังไม่ใส่ค่า `VITE_GOOGLE_SHEETS_WEBHOOK_URL` ระบบสั่งซื้อและ Firebase จะยังทำงานตามปกติ แต่จะยังไม่ส่งข้อมูลไปชีต

## ข้อมูลที่ถูกบันทึก

แท็บ `เว็บออเดอร์` มีหัวคอลัมน์ภาษาไทย ได้แก่ รหัสออเดอร์, เลขคิว, ชื่อลูกค้า, วิธีรับสินค้า, เวลารับโดยประมาณ, สถานที่จัดส่ง, รายการเครื่องดื่ม, จำนวนแก้ว, ยอดรวม, ส่วนลดโปรโมชั่น, สถานะชำระเงิน, ข้อความตรวจสลิป, สถานะคิว และเวลาที่เกี่ยวข้อง

หมายเหตุ: URL ของ Web App เป็นข้อมูลสำหรับเชื่อมต่อ ควรเก็บไว้ใน environment variable และไม่ commit ค่า URL จริงลง public repository
