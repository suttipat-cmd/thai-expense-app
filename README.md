# บันทึกรายรับรายจ่าย

เอกสารนี้คือข้อมูลล่าสุดของเว็บนี้เสมอ อ่านไฟล์นี้ไฟล์เดียวควรเข้าใจภาพรวม วิธีติดตั้ง วิธีใช้งาน โครงสร้างข้อมูล และวิธีพัฒนาต่อทั้งหมด

## สถานะชุดไฟล์นี้

ชุดนี้จัดใหม่สำหรับ GitHub Pages โดยมีไฟล์ใน repository แค่ 4 ไฟล์ตามที่กำหนด

```text
README.md
index.html
script.js
style.css
```

ไม่มี `Code.gs` เป็นไฟล์แยกใน GitHub เพื่อให้โครงสร้างไฟล์เรียบง่ายที่สุด แต่โค้ด Google Apps Script สำหรับคัดลอกไปใช้จริงอยู่ในหัวข้อ **โค้ด Google Apps Script** ของ README นี้

## ภาพรวมเว็บ

เว็บแอปบันทึกรายรับรายจ่ายส่วนตัว ภาษาไทยล้วน ใช้งานคนเดียว ผ่านโทรศัพท์มือถือเป็นหลัก

แนวคิด UI คือ

> จดง่าย ใช้ไว เห็นเงินชัด

เว็บนี้เป็น static web app เปิดบน GitHub Pages และเชื่อมกับ Google Sheet ผ่าน Google Apps Script

ถ้ายังไม่ได้ตั้งค่า Apps Script เว็บจะทำงานด้วยข้อมูลในเครื่องผ่าน `localStorage` ก่อน เพื่อให้ทดสอบ UI และฟีเจอร์ได้ทันที

## ฟีเจอร์หลัก

- เพิ่มรายการรายรับ
- เพิ่มรายการรายจ่าย
- แก้ไขรายการเดิม
- ลบรายการเดิม
- ดูสรุปหน้าแรกของเดือนปัจจุบัน
- ดูรายการย้อนหลังแยกตามเดือน
- ดูสรุปรายรับ รายจ่าย และคงเหลือ
- ดูรายจ่ายแยกตามหมวดหมู่พร้อมกราฟโดนัท
- ตั้งค่า Apps Script URL และ Token จากหน้าเว็บ
- ใช้งานแบบข้อมูลในเครื่องได้ก่อนเชื่อม Google Sheet

## โครงสร้างหน้าจอ

### 1. หน้าแรก

ใช้ดูภาพรวมของเดือนที่เลือก

ข้อมูลหลัก:

- คงเหลือเดือนนี้
- รับเข้า
- ใช้ไป
- วันนี้ใช้ไป
- ปุ่ม `+ เพิ่มรายการ`
- รายการล่าสุด
- ปุ่มตั้งค่าการเชื่อมต่อ

### 2. เพิ่มรายการ

ใช้เพิ่มหรือแก้ไขรายการ

ข้อมูลที่กรอก:

- ประเภท: รายจ่าย / รายรับ
- จำนวนเงิน
- หมวดหมู่
- วันที่
- บันทึกเพิ่มเติม

ค่าเริ่มต้น:

- ประเภทเริ่มต้นเป็น `รายจ่าย`
- วันที่เริ่มต้นเป็นวันนี้
- หมวดหมู่เริ่มต้นเป็น `อื่นๆ`

### 3. รายการ

ใช้ดูรายการย้อนหลังตามเดือน

ข้อมูลหลัก:

- เปลี่ยนเดือนด้วยปุ่มซ้าย/ขวา
- รายรับรวมของเดือน
- รายจ่ายรวมของเดือน
- รายการแบ่งกลุ่มตามวัน
- แตะรายการเพื่อแก้ไขหรือลบ

### 4. สรุป

ใช้ดูภาพรวมการใช้เงินของเดือน

ข้อมูลหลัก:

- รายรับรวม
- รายจ่ายรวม
- คงเหลือ
- รายจ่ายตามหมวดหมู่
- กราฟโดนัท
- หมวดที่ใช้เยอะสุด

## หมวดหมู่เริ่มต้น

### รายรับ

- เงินเดือน
- รายได้เสริม
- ของขวัญ
- อื่นๆ

### รายจ่าย

- อาหาร
- เดินทาง
- บิล
- ซื้อของ
- สุขภาพ
- งาน
- อื่นๆ

## โครงสร้างไฟล์

### README.md

เอกสารหลักของโปรเจกต์ ต้องอัปเดตเสมอเมื่อมีการแก้ไขระบบ วิธีติดตั้ง API หรือโครงสร้างข้อมูล

### index.html

โครง HTML หลักของเว็บ มีจุดเชื่อมกับ `style.css` และ `script.js`

### style.css

สไตล์ทั้งหมดของเว็บ ใช้แนว mobile-first และออกแบบให้เหมือน mobile app

### script.js

ตรรกะทั้งหมดของเว็บ เช่น การเรนเดอร์หน้าจอ การจัดการฟอร์ม การคำนวณสรุป การบันทึกในเครื่อง และการเชื่อมต่อ Apps Script

## โครงสร้างข้อมูล

รายการหนึ่งรายการมีข้อมูลดังนี้

| ฟิลด์ | ความหมาย | ตัวอย่าง |
|---|---|---|
| id | รหัสรายการ | `tx_...` หรือ UUID |
| type | ประเภท | `income` หรือ `expense` |
| amount | จำนวนเงิน | `120` |
| category | หมวดหมู่ | `อาหาร` |
| date | วันที่ | `2026-06-21` |
| note | หมายเหตุ | `อาหารกลางวัน` |
| createdAt | เวลาที่สร้าง | ISO string |
| updatedAt | เวลาที่แก้ไขล่าสุด | ISO string |

## โครงสร้าง Google Sheet

ระบบจะสร้างชีตชื่อ `Transactions` ให้อัตโนมัติถ้ายังไม่มี

หัวตารางที่ใช้:

```text
id | type | amount | category | date | note | createdAt | updatedAt
```

## วิธีติดตั้งบน GitHub Pages

1. สร้าง repository ใหม่ใน GitHub
2. อัปโหลดไฟล์ 4 ไฟล์นี้เข้า root ของ repository
   - `README.md`
   - `index.html`
   - `script.js`
   - `style.css`
3. ไปที่ `Settings`
4. ไปที่ `Pages`
5. เลือก Source เป็น branch `main` และ folder `/root`
6. กด Save
7. รอ GitHub สร้าง URL ของเว็บ
8. เปิด URL ที่ได้ผ่านมือถือ

## วิธีใช้งานแบบยังไม่เชื่อม Google Sheet

เปิดเว็บจาก GitHub Pages แล้วใช้งานได้ทันที ระบบจะเก็บข้อมูลไว้ในเครื่องของเบราว์เซอร์ด้วย `localStorage`

เหมาะสำหรับ:

- ทดสอบ UI
- ทดลองบันทึกข้อมูล
- ใช้งานชั่วคราวในเครื่องเดียว

ข้อจำกัด:

- ถ้าเปลี่ยนเครื่องหรือเปลี่ยนเบราว์เซอร์ ข้อมูลจะไม่ตามไปด้วย
- ถ้าล้างข้อมูลเบราว์เซอร์ ข้อมูลในเครื่องจะหาย

## วิธีเชื่อมกับ Google Sheet

### ขั้นตอนที่ 1: สร้าง Google Sheet

1. เปิด Google Drive
2. สร้าง Google Sheet ใหม่
3. ตั้งชื่อไฟล์ เช่น `บันทึกรายรับรายจ่าย`
4. เข้าเมนู `Extensions` > `Apps Script`

### ขั้นตอนที่ 2: ใส่โค้ด Apps Script

ลบโค้ดเดิมใน Apps Script แล้วคัดลอกโค้ดจากหัวข้อ **โค้ด Google Apps Script** ไปวาง

จากนั้นแก้ค่า `TOKEN` เป็นข้อความลับของคุณ เช่น

```javascript
const TOKEN = "my-secret-token-123";
```

### ขั้นตอนที่ 3: Deploy เป็น Web App

1. กด `Deploy`
2. เลือก `New deployment`
3. กดรูปเฟือง แล้วเลือก `Web app`
4. ตั้งค่า
   - Execute as: `Me`
   - Who has access: `Anyone`
5. กด `Deploy`
6. อนุญาตสิทธิ์ตามขั้นตอนของ Google
7. คัดลอก Web App URL ที่ลงท้ายด้วย `/exec`

### ขั้นตอนที่ 4: ตั้งค่าในหน้าเว็บ

1. เปิดเว็บ GitHub Pages
2. กดปุ่มตั้งค่า `⚙`
3. วาง Apps Script Web App URL
4. ใส่ Token ให้ตรงกับใน Apps Script
5. กด `ทดสอบ`
6. ถ้าขึ้นว่าเชื่อมต่อสำเร็จ ให้กด `บันทึก`

## โค้ด Google Apps Script

คัดลอกโค้ดนี้ไปวางใน Apps Script ของ Google Sheet

```javascript
const TOKEN = "เปลี่ยนเป็น-token-ของคุณ";
const SHEET_NAME = "Transactions";
const HEADERS = ["id", "type", "amount", "category", "date", "note", "createdAt", "updatedAt"];

function doGet(e) {
  return handleRequest_(e);
}

function doPost(e) {
  return handleRequest_(e);
}

function handleRequest_(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || "list";
    const payload = parsePayload_(e, params);
    const requestToken = params.token || payload.token || "";

    if (TOKEN && requestToken !== TOKEN) {
      return json_({ ok: false, error: "TOKEN_INVALID" });
    }

    const sheet = getSheet_();

    if (action === "ping") {
      return json_({ ok: true, message: "connected" });
    }

    if (action === "list") {
      return json_({ ok: true, data: readAll_(sheet) });
    }

    if (action === "create") {
      const transaction = normalizeTransaction_(payload.transaction || payload);
      sheet.appendRow(toRow_(transaction));
      return json_({ ok: true, data: transaction });
    }

    if (action === "update") {
      const transaction = normalizeTransaction_(payload.transaction || payload);
      const rowNumber = findRowById_(sheet, transaction.id);
      if (!rowNumber) return json_({ ok: false, error: "NOT_FOUND" });
      sheet.getRange(rowNumber, 1, 1, HEADERS.length).setValues([toRow_(transaction)]);
      return json_({ ok: true, data: transaction });
    }

    if (action === "delete") {
      const id = String(payload.id || "");
      const rowNumber = findRowById_(sheet, id);
      if (!rowNumber) return json_({ ok: false, error: "NOT_FOUND" });
      sheet.deleteRow(rowNumber);
      return json_({ ok: true, data: { id: id } });
    }

    return json_({ ok: false, error: "UNKNOWN_ACTION" });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function parsePayload_(e, params) {
  if (params && params.payload) {
    return JSON.parse(params.payload || "{}");
  }

  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents || "{}");
    } catch (error) {
      return {};
    }
  }

  return {};
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = HEADERS.every(function(header, index) {
    return firstRow[index] === header;
  });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function readAll_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();

  return values
    .filter(function(row) { return row[0]; })
    .map(function(row) {
      const item = {};
      HEADERS.forEach(function(header, index) {
        item[header] = row[index];
      });

      item.id = String(item.id || "");
      item.type = item.type === "income" ? "income" : "expense";
      item.amount = Number(item.amount) || 0;
      item.category = String(item.category || "อื่นๆ");
      item.date = formatDateValue_(item.date);
      item.note = String(item.note || "");
      item.createdAt = String(item.createdAt || "");
      item.updatedAt = String(item.updatedAt || "");

      return item;
    });
}

function findRowById_(sheet, id) {
  if (!id) return 0;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let index = 0; index < ids.length; index++) {
    if (String(ids[index][0]) === String(id)) {
      return index + 2;
    }
  }
  return 0;
}

function normalizeTransaction_(input) {
  const now = new Date().toISOString();
  const date = input.date ? String(input.date).slice(0, 10) : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  return {
    id: String(input.id || Utilities.getUuid()),
    type: input.type === "income" ? "income" : "expense",
    amount: Number(input.amount) || 0,
    category: String(input.category || "อื่นๆ"),
    date: date,
    note: String(input.note || ""),
    createdAt: String(input.createdAt || now),
    updatedAt: String(input.updatedAt || now)
  };
}

function toRow_(transaction) {
  return HEADERS.map(function(header) {
    return transaction[header];
  });
}

function formatDateValue_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value || "").slice(0, 10);
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## API ที่เว็บเรียกใช้

เว็บส่งข้อมูลไป Apps Script ด้วย `POST` และ `URLSearchParams`

พารามิเตอร์หลัก:

| ชื่อ | ความหมาย |
|---|---|
| action | คำสั่ง เช่น `list`, `create`, `update`, `delete`, `ping` |
| token | token ที่ตั้งไว้ใน Apps Script |
| payload | JSON string ของข้อมูล |

### action: ping

ใช้ทดสอบการเชื่อมต่อ

### action: list

ดึงรายการทั้งหมดจาก Google Sheet

### action: create

เพิ่มรายการใหม่

payload:

```json
{
  "transaction": {
    "id": "...",
    "type": "expense",
    "amount": 120,
    "category": "อาหาร",
    "date": "2026-06-21",
    "note": "อาหารกลางวัน",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### action: update

แก้ไขรายการเดิม ใช้ payload เหมือน `create`

### action: delete

ลบรายการ

payload:

```json
{
  "id": "..."
}
```

## การตั้งค่า Token

Token ในระบบนี้ใช้สำหรับกันการเรียก API แบบเปิดเผยทั่วไป แต่ไม่ใช่ระบบความปลอดภัยระดับสูง เพราะเว็บฝั่ง GitHub Pages เป็น frontend ที่ผู้ใช้สามารถดูโค้ดได้

เหมาะกับการใช้งานส่วนตัวตามโจทย์ของเว็บนี้

คำแนะนำ:

- ตั้ง token เป็นข้อความยาวพอสมควร
- ไม่ใช้ token ที่ซ้ำกับรหัสผ่านสำคัญ
- ถ้าคิดว่ามีคนรู้ token ให้เปลี่ยน token ใน Apps Script และหน้าเว็บ

## วิธีใช้งานจริง

1. เปิดเว็บผ่านมือถือ
2. ถ้ายังไม่เชื่อม Google Sheet ให้กดตั้งค่าแล้วใส่ Apps Script URL และ Token
3. กด `+ เพิ่มรายการ`
4. เลือก `รายจ่าย` หรือ `รายรับ`
5. ใส่จำนวนเงิน
6. เลือกหมวดหมู่
7. เลือกวันที่
8. ใส่บันทึกเพิ่มเติมถ้าต้องการ
9. กด `บันทึก`
10. ดูยอดรวมที่หน้าแรก รายการย้อนหลังที่หน้า `รายการ` และกราฟที่หน้า `สรุป`

## วิธีแก้ไขรายการ

1. ไปที่หน้า `รายการ` หรือแตะรายการล่าสุดจากหน้าแรก
2. แตะรายการที่ต้องการแก้ไข
3. แก้ข้อมูล
4. กด `บันทึก`

## วิธีลบรายการ

1. แตะรายการที่ต้องการลบ
2. กด `ลบรายการนี้`
3. ยืนยันการลบ

## สีและ UI

สีหลักที่ใช้ในเว็บ:

| การใช้งาน | สี |
|---|---|
| Action หลัก | `#2563EB` |
| รายรับ | `#16A34A` |
| รายจ่าย | `#EF4444` |
| พื้นหลัง | `#F7F7F2` |
| ข้อความหลัก | `#0F172A` |
| ข้อความรอง | `#64748B` |

## ข้อจำกัดปัจจุบัน

- ไม่มีระบบ login
- ใช้งานคนเดียวเป็นหลัก
- ไม่แยกบัญชีเงินสด ธนาคาร หรือบัตรเครดิต
- ไม่มีแนบรูปสลิป
- ไม่มี export เป็นไฟล์
- ไม่มีโหมดหลายผู้ใช้
- Token เป็นการป้องกันแบบง่าย ไม่ใช่ระบบ auth เต็มรูปแบบ

## แนวทางพัฒนาต่อ

สิ่งที่สามารถเพิ่มภายหลังได้:

- ค้นหารายการ
- กรองตามหมวดหมู่
- Export CSV
- ตั้งงบรายเดือน
- เพิ่ม/แก้ไขหมวดหมู่เอง
- ทำ PWA เต็มรูปแบบ
- เพิ่มระบบสำรองข้อมูล
- เพิ่มหน้าเปรียบเทียบรายเดือน

## การแก้ไขโค้ดเบื้องต้น

### เปลี่ยนหมวดหมู่

แก้ใน `script.js` ที่ตัวแปร `CATEGORIES`

### เปลี่ยนสี

แก้ใน `style.css` ที่ส่วน `:root`

### เปลี่ยนข้อความในเว็บ

ข้อความส่วนใหญ่ถูกสร้างใน `script.js` ผ่านฟังก์ชัน `renderHome`, `renderAdd`, `renderList`, และ `renderSummary`

## บันทึกการเปลี่ยนแปลงล่าสุด

### v1.0.0

- จัดโครงสร้าง GitHub Pages ให้เหลือ 4 ไฟล์
- เพิ่ม UI ภาษาไทยแบบ mobile-first
- เพิ่มหน้าแรก เพิ่มรายการ รายการ และสรุป
- เพิ่มการบันทึกข้อมูลในเครื่องผ่าน localStorage
- เพิ่มการเชื่อมต่อ Google Sheet ผ่าน Apps Script
- เพิ่มโค้ด Apps Script ไว้ใน README.md เพื่อไม่ต้องมีไฟล์ Code.gs แยก
