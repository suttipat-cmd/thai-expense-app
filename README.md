# บันทึกรายรับรายจ่าย

เว็บแอปบันทึกรายรับรายจ่ายภาษาไทย ใช้งานบนมือถือเป็นหลัก เปิดผ่าน GitHub Pages และเก็บข้อมูลใน Google Sheet ผ่าน Google Apps Script

แนวคิดหลัก:

> จดง่าย ใช้ไว เห็นเงินชัด และรู้สถานะการซิงก์เสมอ

## ไฟล์ในชุดนี้

```text
README.md
index.html
style.css
script.js
Code.gs
```

## สิ่งที่เปลี่ยนในเวอร์ชันนี้

### v1.6.0 UX Polish / Production-ready pass

- เพิ่มสถานะการซิงก์ เช่น `ซิงก์แล้ว`, `กำลังซิงก์`, `ซิงก์ไม่สำเร็จ`, `ใช้ข้อมูลในเครื่อง`
- เพิ่มเวลาซิงก์ล่าสุด และบันทึกไว้ใน `localStorage`
- เพิ่มหน้า `ตั้งค่า` สำหรับตรวจ Apps Script URL, Token, จำนวนข้อมูลในเครื่อง, Google Sheet URL และทดสอบการเชื่อมต่อ
- เพิ่มปุ่มบันทึกแบบ sticky ในหน้าเพิ่มรายการ เพื่อให้บันทึกได้ง่ายบนมือถือ
- เพิ่ม inline validation ใต้ field จำนวนเงินและวันที่
- เพิ่มคำใบ้/chevron ใน transaction card เพื่อให้รู้ว่าแตะเพื่อแก้ไขได้
- เพิ่ม filter ในหน้ารายการ: ทั้งหมด / รายจ่าย / รายรับ / ค้นหา / หมวดหมู่ / วันที่
- เพิ่ม quick action จากหน้าแรก: กด `วันนี้ใช้ไป` เพื่อดูรายการรายจ่ายของวันนี้ทันที
- เปลี่ยนการลบจาก browser confirm เป็น bottom sheet confirmation ที่แสดงรายละเอียดรายการก่อนลบ
- เพิ่ม unsaved changes warning เมื่อออกจากหน้าเพิ่มรายการโดยยังไม่ได้บันทึก
- เพิ่ม insight แบบ rule-based ในหน้าสรุป โดยไม่ใช้ AI
- เพิ่ม accessibility เช่น `aria-current`, `aria-pressed`, focus state, accessible label และ semantic button
- ปรับ responsive layout สำหรับจอเล็ก 320–390px และตอนมี bottom nav/sticky save
- Apps Script ส่ง `meta` กลับมาด้วย เช่น `spreadsheetUrl`, `spreadsheetId`, `serverTime`
- ไม่มี OCR / Typhoon / AI / API Key ภายนอก

## ฟีเจอร์หลัก

- เพิ่มรายการรายรับ
- เพิ่มรายการรายจ่าย
- แก้ไขรายการเดิม
- ลบรายการเดิมด้วย confirmation
- ดูสรุปหน้าแรกของเดือนปัจจุบัน
- ดูรายการย้อนหลังแยกตามเดือน
- ค้นหาและกรองรายการ
- ดูสรุปรายรับ รายจ่าย และคงเหลือ
- ดูรายจ่ายแยกตามหมวดหมู่พร้อมกราฟโดนัท
- ดูข้อสังเกตเดือนนี้แบบ rule-based
- เชื่อม Google Sheet ผ่าน Apps Script
- ใช้ `localStorage` เป็น fallback เมื่อยังไม่ได้ตั้งค่า Apps Script หรือเชื่อมต่อไม่ได้

## โครงสร้างหน้าจอ

### 1. หน้าแรก

- เดือนปัจจุบัน
- สถานะการซิงก์
- คงเหลือเดือนนี้
- รายรับรวม / รายจ่ายรวม
- วันนี้ใช้ไป กดเพื่อดูรายการวันนี้
- ปุ่ม `+ เพิ่มรายการ`
- รายการล่าสุด

### 2. รายการ

- เปลี่ยนเดือนด้วยปุ่มซ้าย/ขวา
- สถานะการซิงก์
- รายรับรวม / รายจ่ายรวมของเดือน
- ตัวกรองทั้งหมด / รายจ่าย / รายรับ
- ค้นหาโน้ตหรือหมวดหมู่
- กรองตามหมวดหมู่
- กรองตามวันที่
- รายการแบ่งกลุ่มตามวัน
- แตะรายการเพื่อแก้ไขหรือลบ

### 3. เพิ่มรายการ

- ประเภท: รายจ่าย / รายรับ
- จำนวนเงิน
- หมวดหมู่
- วันที่
- บันทึกเพิ่มเติม
- ปุ่มบันทึกแบบ sticky เหนือ bottom nav
- inline validation
- warning เมื่อออกจากหน้าโดยยังไม่ได้บันทึก

### 4. สรุป

- รายรับรวม
- รายจ่ายรวม
- คงเหลือ
- รายจ่ายตามหมวดหมู่
- กราฟโดนัท
- ข้อสังเกตเดือนนี้
- หมวดที่ใช้เยอะสุด

### 5. ตั้งค่า

- สถานะ Apps Script URL
- สถานะ Token
- เวลาซิงก์ล่าสุด
- จำนวนข้อมูลในเครื่อง
- ปุ่มเปิด Google Sheet ถ้ามี URL
- ปุ่มทดสอบการเชื่อมต่อ
- ปุ่มซิงก์ข้อมูลใหม่

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

ระบบจะจำหมวดล่าสุดที่ใช้แยกตามรายรับ/รายจ่าย เพื่อช่วยให้บันทึกรายการซ้ำเร็วขึ้น

## โครงสร้างข้อมูล

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

### ขั้นตอนที่ 3: Deploy Apps Script เป็น Web App

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

### ขั้นตอนที่ 4: ทดสอบให้ Apps Script สร้าง Google Sheet

เปิด URL นี้ในเบราว์เซอร์ โดยเปลี่ยน URL และ token ให้ตรงของคุณ

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=setup&token=my-secret-token-123
```

ถ้าสำเร็จจะได้ JSON ประมาณนี้

```json
{
  "ok": true,
  "message": "connected",
  "meta": {
    "spreadsheetId": "...",
    "spreadsheetUrl": "...",
    "sheetName": "Transactions",
    "serverTime": "..."
  }
}
```

### ขั้นตอนที่ 5: ใส่ Apps Script URL ในหน้าเว็บ

เปิดไฟล์ `script.js` แล้วแก้ส่วนบนสุด

```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/DEPLOYMENT_ID/exec",
  TOKEN: "my-secret-token-123"
};
```

ค่า `TOKEN` ต้องตรงกับใน `Code.gs`

### ขั้นตอนที่ 6: Push ขึ้น GitHub

```bash
git add .
git commit -m "release expense app ux polish"
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

### ขั้นตอนที่ 7: เปิด GitHub Pages

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

## วิธีใช้งาน

1. เปิดเว็บจาก GitHub Pages
2. กด `+ เพิ่มรายการ`
3. เลือก `รายจ่าย` หรือ `รายรับ`
4. ใส่จำนวนเงิน
5. เลือกหมวดหมู่
6. เลือกวันที่
7. ใส่บันทึกเพิ่มเติมถ้าต้องการ
8. กด `บันทึก` หรือปุ่ม sticky save ด้านล่าง
9. ไปหน้า `รายการ` เพื่อดู ค้นหา กรอง แก้ไข หรือลบย้อนหลัง
10. ไปหน้า `สรุป` เพื่อดูรายจ่ายตามหมวดหมู่และข้อสังเกต
11. ไปหน้า `ตั้งค่า` เพื่อตรวจสถานะการเชื่อมต่อ

## การทำงานของ Apps Script

Apps Script มี action หลักดังนี้

| action | หน้าที่ |
|---|---|
| setup | สร้าง/ตรวจ Google Sheet และคืน URL ของไฟล์ |
| ping | ทดสอบการเชื่อมต่อ |
| list | ดึงรายการทั้งหมด หรือดึงตามเดือนเมื่อส่ง payload.month |
| create | เพิ่มรายการใหม่ |
| update | แก้ไขรายการเดิม |
| delete | ลบรายการ |

เว็บเรียก Apps Script ด้วย JSONP เพื่อหลีกเลี่ยงปัญหา CORS ตอนรันบน GitHub Pages

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

แล้วคัดลอกค่า `meta.spreadsheetUrl`

หรือเปิดจากหน้า `ตั้งค่า` ในเว็บหลังจากซิงก์สำเร็จ

## สีและ UI

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
- ไม่มี OCR / AI ในเวอร์ชันนี้
- Token เป็นการป้องกันแบบง่าย ไม่ใช่ระบบ auth เต็มรูปแบบ
- Token อยู่ใน frontend จึงไม่ควรใช้เป็นรหัสผ่านสำคัญ
- ถ้ารายการเยอะมาก ควรพัฒนา pagination หรือ backend ที่กรองข้อมูลก่อนส่งกลับ

## แนวทางพัฒนาต่อ

- Export CSV
- ตั้งงบรายเดือน
- เพิ่ม/แก้ไขหมวดหมู่เอง
- ทำ PWA เต็มรูปแบบ
- เพิ่มหน้าเปรียบเทียบรายเดือน
- เพิ่ม backend ที่เหมาะกว่า Apps Script ถ้าต้องการ OCR หรือ AI ในอนาคต

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

### เปลี่ยนหมวดหมู่

แก้ใน `script.js` ที่ตัวแปร `CATEGORIES`

### เปลี่ยนสี

แก้ใน `style.css` ที่ส่วน `:root`

## Checklist หลังติดตั้ง

- เปิดหน้าแรกแล้วเห็นยอดเงินและสถานะซิงก์
- กดเพิ่มรายการแล้วปุ่ม sticky save แสดงถูกต้อง
- กรอกจำนวนเงิน 0 แล้วเห็น inline validation
- บันทึกแล้วรายการเข้า Google Sheet
- แตะรายการแล้วเข้าแก้ไขได้
- กดลบแล้วเห็น bottom sheet confirmation
- กรองรายการด้วย type/category/date/search ได้
- กดวันนี้ใช้ไปแล้วไปหน้ารายการพร้อม filter วันนี้
- หน้า summary แสดงกราฟและข้อสังเกต
- หน้า settings แสดง Google Sheet URL หลังซิงก์สำเร็จ
