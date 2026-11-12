/**
 * MoodDrink -> Google Sheets webhook
 *
 * Spreadsheet: 1Zx8scOAJsFASctsl6zbABvXW6_VOhqoo6X17MkmLX10
 * Target tab: เว็บออเดอร์ (sheetId 1255825009)
 *
 * Deploy as: Web app, Execute as Me, Who has access: Anyone.
 * Keep the deployed URL private enough for this app; the endpoint only writes
 * the fields sent by the website and upserts rows by orderId.
 */
const SPREADSHEET_ID = "1Zx8scOAJsFASctsl6zbABvXW6_VOhqoo6X17MkmLX10";
const TARGET_SHEET_TITLE = "เว็บออเดอร์";
const HEADERS = [
  "รหัสออเดอร์",
  "เลขคิว",
  "ชื่อลูกค้า",
  "วิธีรับสินค้า",
  "เวลารับโดยประมาณ",
  "สถานที่จัดส่ง",
  "รายการเครื่องดื่ม",
  "จำนวนแก้ว",
  "ยอดรวม",
  "ส่วนลดโปรโมชั่น",
  "สถานะชำระเงิน",
  "ข้อความตรวจสลิป",
  "สถานะคิว",
  "สร้างเมื่อ",
  "แก้ไขล่าสุด",
  "ส่งสลิปเมื่อ",
  "ยืนยันการชำระเงินเมื่อ",
];

const FIELD_TO_HEADER = {
  orderId: "รหัสออเดอร์",
  queueNumber: "เลขคิว",
  customerName: "ชื่อลูกค้า",
  fulfillmentMethod: "วิธีรับสินค้า",
  requestedAt: "เวลารับโดยประมาณ",
  deliveryLocation: "สถานที่จัดส่ง",
  items: "รายการเครื่องดื่ม",
  glasses: "จำนวนแก้ว",
  totalPrice: "ยอดรวม",
  promotionDiscount: "ส่วนลดโปรโมชั่น",
  paymentStatus: "สถานะชำระเงิน",
  paymentMessage: "ข้อความตรวจสลิป",
  status: "สถานะคิว",
  createdAt: "สร้างเมื่อ",
  updatedAt: "แก้ไขล่าสุด",
  lastSlipSubmittedAt: "ส่งสลิปเมื่อ",
  paymentVerifiedAt: "ยืนยันการชำระเงินเมื่อ",
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (!payload.orderId) throw new Error("orderId is required");

    const sheet = getTargetSheet_();
    const headerMap = ensureHeaders_(sheet);
    const row = findOrderRow_(sheet, headerMap, String(payload.orderId));
    const values = row ? sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0] : [];

    Object.keys(FIELD_TO_HEADER).forEach((field) => {
      const header = FIELD_TO_HEADER[field];
      if (payload[field] === undefined) return;
      values[headerMap[header] - 1] = payload[field];
    });

    if (row) {
      sheet.getRange(row, 1, 1, sheet.getLastColumn()).setValues([values]);
    } else {
      const newRow = new Array(sheet.getLastColumn()).fill("");
      Object.keys(FIELD_TO_HEADER).forEach((field) => {
        const header = FIELD_TO_HEADER[field];
        if (payload[field] !== undefined) newRow[headerMap[header] - 1] = payload[field];
      });
      sheet.appendRow(newRow);
    }

    return json_({ ok: true, orderId: payload.orderId, updated: Boolean(row) });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

function getTargetSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(TARGET_SHEET_TITLE);
  if (!sheet) throw new Error("Target sheet title was not found");
  return sheet;
}

function ensureHeaders_(sheet) {
  const currentLastColumn = Math.max(sheet.getLastColumn(), 1);
  const firstRow = sheet.getRange(1, 1, 1, currentLastColumn).getValues()[0];
  const headers = firstRow.some((value) => value !== "") ? firstRow.map(String) : [];

  HEADERS.forEach((header) => {
    if (!headers.includes(header)) headers.push(header);
  });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return headers.reduce((map, header, index) => {
    map[header] = index + 1;
    return map;
  }, {});
}

function findOrderRow_(sheet, headerMap, orderId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const values = sheet.getRange(2, headerMap[FIELD_TO_HEADER.orderId], lastRow - 1, 1).getValues();
  const index = values.findIndex((row) => String(row[0]) === orderId);
  return index === -1 ? null : index + 2;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
