# บันทึกรายรับรายจ่าย

เอกสารนี้คือข้อมูลล่าสุดของเว็บนี้เสมอ อ่านไฟล์นี้ไฟล์เดียวควรเข้าใจภาพรวม วิธีติดตั้ง วิธีใช้งาน โครงสร้างข้อมูล และวิธีพัฒนาต่อทั้งหมด

## สถานะชุดไฟล์นี้

เว็บแอปบันทึกรายรับรายจ่ายภาษาไทย ใช้งานผ่านมือถือบน GitHub Pages และเก็บข้อมูลใน Google Sheet ผ่าน Google Apps Script

ไฟล์ในชุดนี้มี 5 ไฟล์

```text
README.md
index.html
style.css
script.js
Code.gs
```

## สิ่งที่เพิ่มในเวอร์ชันนี้

- เพิ่ม OCR สลิปธนาคารด้วย Typhoon OCR
- ภาพสลิปไม่ถูกเก็บลง Google Sheet
- OCR เป็นรายจ่ายเสมอ และเป็นแค่ตัวช่วยกรอกฟอร์ม ผู้ใช้ต้องตรวจสอบก่อนกดบันทึก
- แยกปุ่มสลิปเป็น 2 ปุ่ม
  - `เลือกรูปจากอัลบั้ม` ไม่บังคับเปิดกล้อง
  - `ถ่ายรูปสลิป` เปิดกล้องหลัง
- ปรับ OCR ให้เร็วขึ้น โดยบีบอัดรูปก่อนส่ง ลดขนาด payload และให้ Typhoon ตอบ JSON สั้นๆ
- เพิ่ม loading แบบแยกขั้นตอน เช่น กำลังบีบอัดรูป กำลังอ่านสลิป กำลังเติมข้อมูล
- ลดการโหลดข้อมูลซ้ำหลังบันทึก/ลบ เพื่อให้แอปตอบสนองเร็วขึ้น
- ปรับ UI กันล้นกรอบ ทับซ้อน และระยะห่างบนจอมือถือเล็ก โดยเฉพาะ field วันที่
- Apps Script สร้าง Google Sheet ให้อัตโนมัติ
- `TYPHOON_API_KEY` เก็บใน Script Properties ไม่ต้องใส่ในโค้ด

## ภาพรวมเว็บ

เว็บนี้เป็นเว็บแอปบันทึกรายรับรายจ่ายส่วนตัว ภาษาไทยล้วน ใช้งานคนเดียว ผ่านโทรศัพท์มือถือเป็นหลัก

แนวคิด UI คือ

> จดง่าย ใช้ไว เห็นเงินชัด

เว็บเป็น static web app บน GitHub Pages ส่วนข้อมูลเก็บใน Google Sheet ที่สร้างโดย Apps Script อัตโนมัติ

## ฟีเจอร์หลัก

- เพิ่มรายการรายรับ
- เพิ่มรายการรายจ่าย
- สแกนสลิปธนาคารเพื่อช่วยกรอกข้อมูลรายจ่าย
- แก้ไขรายการเดิม
- ลบรายการเดิม
- ดูสรุปหน้าแรกของเดือนปัจจุบัน
- ดูรายการย้อนหลังแยกตามเดือน
- ดูสรุปรายรับ รายจ่าย และคงเหลือ
- ดูรายจ่ายแยกตามหมวดหมู่พร้อมกราฟโดนัท
- เชื่อม Google Sheet ผ่าน Apps Script
- ถ้ายังไม่ใส่ Apps Script URL ใน `script.js` จะใช้งานด้วยข้อมูลในเครื่องผ่าน `localStorage` ได้ก่อน

## โครงสร้างหน้าจอ

### 1. หน้าแรก

ข้อมูลหลัก:

- คงเหลือเดือนนี้
- รับเข้า
- ใช้ไป
- วันนี้ใช้ไป
- ปุ่ม `+ เพิ่มรายการ`
- รายการล่าสุด
- ปุ่มโหลดข้อมูลใหม่

### 2. เพิ่มรายการ

ข้อมูลที่กรอก:

- ประเภท: รายจ่าย / รายรับ
- ปุ่ม OCR สลิป
- จำนวนเงิน
- หมวดหมู่
- วันที่
- บันทึกเพิ่มเติม

ค่าเริ่มต้น:

- ประเภทเริ่มต้นเป็น `รายจ่าย`
- วันที่เริ่มต้นเป็นวันนี้
- หมวดหมู่เริ่มต้นเป็น `อื่นๆ`

### 3. รายการ

ข้อมูลหลัก:

- เปลี่ยนเดือนด้วยปุ่มซ้าย/ขวา
- รายรับรวมของเดือน
- รายจ่ายรวมของเดือน
- รายการแบ่งกลุ่มตามวัน
- แตะรายการเพื่อแก้ไขหรือลบ

### 4. สรุป

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

Apps Script จะสร้างไฟล์ Google Sheet ชื่อ `บันทึกรายรับรายจ่าย` ให้อัตโนมัติ

ภายในไฟล์จะมีชีตชื่อ `Transactions`

หัวตารางที่ใช้คือ

```text
id | type | amount | category | date | note | createdAt | updatedAt
```

## ขั้นตอนติดตั้งแบบสมบูรณ์

### ขั้นตอนที่ 1: อัปโหลดไฟล์ขึ้น GitHub

1. สร้าง repository ใหม่ใน GitHub
2. แตกไฟล์ zip ชุดนี้
3. อัปโหลดไฟล์ทั้งหมดเข้า root ของ repository

ไฟล์ที่ต้องอยู่ใน repository:

```text
README.md
index.html
style.css
script.js
Code.gs
```

หมายเหตุ: `Code.gs` อยู่ใน GitHub เพื่อเก็บโค้ดให้ครบชุด แต่ Google Apps Script จะไม่ได้อ่านไฟล์นี้จาก GitHub โดยตรง ต้องคัดลอกไปวางใน Apps Script เอง

### ขั้นตอนที่ 2: สร้าง Apps Script

1. เข้าเว็บ Google Apps Script
2. สร้าง Project ใหม่
3. ลบโค้ดเดิมออก
4. คัดลอกโค้ดจากไฟล์ `Code.gs` ไปวาง
5. แก้ค่า `TOKEN` ด้านบนสุดของ `Code.gs`

ตัวอย่าง:

```javascript
const TOKEN = "my-secret-token-123";
```

ไม่ต้องสร้าง Google Sheet เอง ระบบจะสร้างให้ตอนเรียกใช้งานครั้งแรก

### ขั้นตอนที่ 3: ใส่ Typhoon API Key ใน Script Properties

ไม่ต้องใส่ Typhoon API Key ลงในโค้ด

ให้ใส่ใน Script Properties แทน:

1. เปิด Apps Script Project
2. ไปที่ `Project Settings`
3. หาเมนู `Script Properties`
4. กด `Add script property`
5. ใส่ค่า:

```text
Property: TYPHOON_API_KEY
Value: ใส่ Typhoon API Key ของคุณ
```

6. กด Save

ข้อดีคือ API Key จะไม่อยู่ใน GitHub และไม่อยู่ใน frontend

### ขั้นตอนที่ 4: Deploy Apps Script เป็น Web App

1. กด `Deploy`
2. เลือก `New deployment`
3. กดรูปเฟือง แล้วเลือก `Web app`
4. ตั้งค่า
   - Description: `expense api`
   - Execute as: `Me`
   - Who has access: `Anyone`
5. กด `Deploy`
6. อนุญาตสิทธิ์ตามขั้นตอนของ Google
7. คัดลอก Web App URL ที่ลงท้ายด้วย `/exec`

### ขั้นตอนที่ 5: ทดสอบให้ Apps Script สร้าง Google Sheet

เปิด URL นี้ในเบราว์เซอร์ โดยเปลี่ยน URL และ token ให้ตรงของคุณ

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=setup&token=my-secret-token-123
```

ถ้าสำเร็จจะได้ JSON ประมาณนี้

```json
{
  "ok": true,
  "message": "connected",
  "spreadsheetId": "...",
  "spreadsheetUrl": "...",
  "sheetName": "Transactions",
  "typhoonOcrConfigured": true
}
```

ถ้า `typhoonOcrConfigured` เป็น `false` ให้กลับไปตรวจ Script Properties ว่ามี `TYPHOON_API_KEY` แล้วหรือยัง

### ขั้นตอนที่ 6: ใส่ Apps Script URL ในหน้าเว็บ

เปิดไฟล์ `script.js` แล้วแก้ส่วนบนสุด

```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/DEPLOYMENT_ID/exec",
  TOKEN: "my-secret-token-123"
};
```

ค่า `TOKEN` ต้องตรงกับใน `Code.gs`

### ขั้นตอนที่ 7: Push ขึ้น GitHub

ใช้คำสั่งนี้ใน VS Code Terminal

```bash
git add .
git commit -m "update expense app with slip OCR"
git push
```

ถ้ายังไม่เคยตั้ง git repository ให้ใช้ชุดนี้แทน

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git
git push -u origin main
```

### ขั้นตอนที่ 8: เปิด GitHub Pages

1. ไปที่ GitHub repository
2. เข้า `Settings`
3. เข้า `Pages`
4. Source เลือก branch `main`
5. Folder เลือก `/root`
6. กด Save
7. รอ GitHub Pages สร้างลิงก์

ลิงก์จะมีรูปแบบประมาณนี้

```text
https://USERNAME.github.io/REPOSITORY-NAME/
```

## วิธีใช้ OCR สลิป

1. เปิดหน้าเว็บ
2. กด `+ เพิ่มรายการ`
3. กด `เลือกรูปจากอัลบั้ม` ถ้ามีภาพสลิปอยู่แล้ว
4. หรือกด `ถ่ายรูปสลิป` ถ้าต้องการเปิดกล้องหลัง
5. รอ loading OCR
6. ระบบจะบีบอัดรูปก่อนส่ง OCR แล้วเติมข้อมูลให้ในฟอร์ม โดยตั้งเป็น `รายจ่าย` เสมอ
7. ตรวจสอบยอดเงิน วันที่ หมวดหมู่ และหมายเหตุ
8. กด `บันทึก` เอง

หมายเหตุ:

- OCR อาจอ่านยอดผิดได้ ต้องตรวจสอบก่อนบันทึก
- ภาพสลิปจะถูกส่งไป Apps Script และ Typhoon OCR เพื่อประมวลผลเท่านั้น
- ระบบไม่บันทึกภาพสลิปลง Google Sheet
- ระบบไม่เก็บภาพสลิปใน repository

## การแก้ปัญหา OCR ช้า/หมดเวลา

เวอร์ชันนี้ปรับให้ OCR เร็วขึ้นโดย:

- ลดขนาดรูปสลิปก่อนส่ง OCR เหลือด้านยาวประมาณ 1120px
- บีบอัดเป็น JPEG คุณภาพประมาณ 0.68 และลดลงอัตโนมัติถ้าไฟล์ยังใหญ่
- จำกัด payload รูปภาพเพื่อไม่ให้ Apps Script และ Typhoon ทำงานหนักเกินไป
- ให้ Typhoon ตอบเป็น JSON สั้นๆ เฉพาะยอดเงิน วันที่ ร้าน/ผู้รับ และข้อความสำคัญ
- เพิ่ม timeout ฝั่งหน้าเว็บสำหรับ OCR เป็นประมาณ 110 วินาที

ถ้ายังหมดเวลา ให้ลอง:

1. ครอปรูปให้เหลือเฉพาะพื้นที่สลิป
2. ใช้รูปที่คมและไม่เอียงมาก
3. หลีกเลี่ยงภาพหน้าจอที่มีพื้นที่ว่างหรือพื้นหลังเยอะ
4. ลองเลือกรูปจากอัลบั้มแทนการถ่ายใหม่
5. ตรวจว่า Typhoon API Key ยังใช้งานได้ และ quota ไม่หมด

## การทำงานของ Apps Script

Apps Script มี action หลักดังนี้

| action | หน้าที่ |
|---|---|
| setup | สร้าง/ตรวจ Google Sheet และคืน URL ของไฟล์ |
| ping | ทดสอบการเชื่อมต่อ |
| list | ดึงรายการทั้งหมด |
| create | เพิ่มรายการใหม่ |
| update | แก้ไขรายการเดิม |
| delete | ลบรายการ |
| ocrSlip | รับรูปสลิปแบบ base64 แล้วส่งต่อ Typhoon OCR |

เว็บเรียก Apps Script ด้วย JSONP สำหรับข้อมูลทั่วไป และใช้ hidden form + iframe bridge สำหรับ OCR เพื่อรองรับ payload รูปภาพที่ยาวกว่า URL ปกติ

## วิธี Deploy Apps Script ใหม่หลังแก้ Code.gs

ถ้าแก้โค้ดใน `Code.gs` ให้ทำตามนี้

1. เปิด Apps Script Project
2. กด `Deploy`
3. เลือก `Manage deployments`
4. กดไอคอนดินสอของ Web App เดิม
5. Version เลือก `New version`
6. กด `Deploy`

โดยทั่วไป Web App URL เดิมจะยังใช้ได้ ถ้าเป็น deployment เดิม

## วิธีดู Google Sheet ที่ระบบสร้าง

เปิด setup URL:

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=setup&token=my-secret-token-123
```

แล้วคัดลอกค่า `spreadsheetUrl`

หรือดูใน Apps Script Project Settings > Script Properties:

```text
SPREADSHEET_ID
SPREADSHEET_URL
```

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
- OCR สลิปเป็นตัวช่วยกรอกข้อมูล ไม่ใช่การยืนยันยอดอัตโนมัติ
- Token เป็นการป้องกันแบบง่าย ไม่ใช่ระบบ auth เต็มรูปแบบ
- Token อยู่ใน frontend จึงไม่ควรใช้เป็นรหัสผ่านสำคัญ

## แนวทางพัฒนาต่อ

- ค้นหารายการ
- กรองตามหมวดหมู่
- Export CSV
- ตั้งงบรายเดือน
- เพิ่ม/แก้ไขหมวดหมู่เอง
- ทำ PWA เต็มรูปแบบ
- เพิ่มหน้าเปรียบเทียบรายเดือน
- เพิ่ม parser เฉพาะธนาคาร ถ้ามีตัวอย่าง OCR ที่อ่านคลาดเคลื่อน

## การแก้ไขโค้ดเบื้องต้น

### เปลี่ยน Apps Script URL

แก้ใน `script.js`

```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/DEPLOYMENT_ID/exec",
  TOKEN: "my-secret-token-123"
};
```

### เปลี่ยน Token ฝั่ง Apps Script

แก้ใน `Code.gs`

```javascript
const TOKEN = "my-secret-token-123";
```

หลังแก้ต้อง Deploy Apps Script ใหม่

### เปลี่ยน Typhoon API Key

ไม่แก้ในโค้ด ให้แก้ที่ Apps Script Project Settings > Script Properties > `TYPHOON_API_KEY`

ถ้าเปลี่ยนแค่ Script Properties โดยทั่วไปไม่ต้อง Deploy ใหม่

### เปลี่ยนหมวดหมู่

แก้ใน `script.js` ที่ตัวแปร `CATEGORIES`

### เปลี่ยนสี

แก้ใน `style.css` ที่ส่วน `:root`

## บันทึกการเปลี่ยนแปลงล่าสุด

### v1.4.0

- ลดขนาด/คุณภาพรูปสลิปก่อนส่ง OCR เพื่อแก้ปัญหาอ่านนานและ timeout
- ลด payload OCR และปรับ prompt ให้ Typhoon ตอบ JSON สั้นๆ
- เพิ่มสถานะ loading แบบละเอียดตอน OCR
- เพิ่ม timeout OCR เป็นประมาณ 110 วินาที
- ลดการดึงข้อมูลซ้ำหลังบันทึกและลบรายการ
- จำกัดจำนวนรายการที่ render พร้อมกันในหน้ารายการเพื่อให้มือถือทำงานลื่นขึ้น
- แก้ CSS ของ `input[type="date"]` เพื่อไม่ให้ field วันที่ล้นขอบจอ
- เพิ่ม responsive hardening สำหรับ input, toast, busy banner และปุ่ม OCR

### v1.3.0

- ย้าย `TYPHOON_API_KEY` ไปไว้ใน Script Properties
- แยกปุ่ม OCR เป็น `เลือกรูปจากอัลบั้ม` และ `ถ่ายรูปสลิป`
- ปุ่มเลือกรูปจากอัลบั้มไม่ใส่ `capture` แล้ว จึงไม่บังคับเปิดกล้อง
- ปรับ CSS กันข้อความ/การ์ด/กราฟล้นบนจอเล็ก
- ปรับ responsive layout ของกราฟ หมวดหมู่ ปุ่ม OCR และ transaction card

### v1.2.0

- เพิ่ม OCR สลิปธนาคารด้วย Typhoon OCR
- เพิ่ม loading และ disabled state
- ไม่บันทึกภาพสลิปลง Google Sheet

### v1.1.0

- เพิ่มไฟล์ `Code.gs` แยกในชุด zip
- Apps Script สร้าง Google Sheet ให้อัตโนมัติ
- Apps Script เก็บ `SPREADSHEET_ID` และ `SPREADSHEET_URL` ใน Script Properties
- หน้าเว็บฝัง Apps Script URL และ Token ผ่าน `CONFIG` ใน `script.js`

### v1.0.0

- เพิ่ม UI ภาษาไทยแบบ mobile-first
- เพิ่มหน้าแรก เพิ่มรายการ รายการ และสรุป
- เพิ่มการบันทึกข้อมูลในเครื่องผ่าน localStorage
- เพิ่มการเชื่อมต่อ Google Sheet ผ่าน Apps Script
