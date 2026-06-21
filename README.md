# บันทึกรายรับรายจ่าย

เอกสารนี้คือข้อมูลล่าสุดของเว็บนี้เสมอ อ่านไฟล์นี้ไฟล์เดียวควรเข้าใจภาพรวม วิธีติดตั้ง วิธีใช้งาน โครงสร้างข้อมูล และวิธีพัฒนาต่อทั้งหมด

## สถานะชุดไฟล์นี้

ชุดนี้เป็นเว็บแอปบันทึกรายรับรายจ่ายภาษาไทยสำหรับใช้งานผ่านมือถือบน GitHub Pages และเชื่อม Google Sheet ผ่าน Google Apps Script

ไฟล์ในชุดนี้มี 5 ไฟล์

```text
README.md
index.html
style.css
script.js
Code.gs
```

รอบนี้ปรับตาม requirement ล่าสุดแล้ว

- Apps Script สร้างไฟล์ Google Sheet ให้อัตโนมัติ
- ไม่ต้องสร้าง Google Sheet เองก่อน
- หน้าเว็บไม่ต้องกรอก Apps Script URL ทุกครั้ง
- ใส่ Apps Script URL และ Token ฝังไว้ใน `script.js` ครั้งเดียว
- รวม `Code.gs` เป็นไฟล์แยกมาให้แล้ว

## ภาพรวมเว็บ

เว็บแอปบันทึกรายรับรายจ่ายส่วนตัว ภาษาไทยล้วน ใช้งานคนเดียว ผ่านโทรศัพท์มือถือเป็นหลัก

แนวคิด UI คือ

> จดง่าย ใช้ไว เห็นเงินชัด

เว็บเป็น static web app บน GitHub Pages ส่วนข้อมูลเก็บใน Google Sheet ที่สร้างโดย Apps Script อัตโนมัติ

## ฟีเจอร์หลัก

- เพิ่มรายการรายรับ
- เพิ่มรายการรายจ่าย
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

## โครงสร้างไฟล์

### README.md

เอกสารหลักของโปรเจกต์ ต้องอัปเดตเสมอเมื่อมีการแก้ไขระบบ วิธีติดตั้ง API หรือโครงสร้างข้อมูล

### index.html

โครง HTML หลักของเว็บ มีจุดเชื่อมกับ `style.css` และ `script.js`

### style.css

สไตล์ทั้งหมดของเว็บ ใช้แนว mobile-first และออกแบบให้เหมือน mobile app

### script.js

ตรรกะทั้งหมดของเว็บ เช่น การเรนเดอร์หน้าจอ การจัดการฟอร์ม การคำนวณสรุป การบันทึกในเครื่อง และการเชื่อมต่อ Apps Script

ไฟล์นี้มีจุดตั้งค่าสำคัญด้านบนสุด

```javascript
const CONFIG = {
  API_URL: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
  TOKEN: "change-this-token"
};
```

### Code.gs

โค้ดฝั่ง Google Apps Script สำหรับ Deploy เป็น Web App

ไฟล์นี้จะสร้าง Google Sheet ให้อัตโนมัติเมื่อมีการเรียก API ครั้งแรก และจะบันทึก `SPREADSHEET_ID` ไว้ใน Script Properties เพื่อให้ครั้งต่อไปใช้ไฟล์เดิม ไม่สร้างซ้ำ

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

### ขั้นตอนที่ 1: สร้าง GitHub Repository

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

> หมายเหตุ: `Code.gs` อยู่ใน GitHub เพื่อเก็บโค้ดให้ครบชุด แต่ Google Apps Script จะไม่ได้อ่านไฟล์นี้จาก GitHub โดยตรง ต้องคัดลอกไปวางใน Apps Script เอง

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

ถ้าสำเร็จจะได้ข้อความ JSON ประมาณนี้

```json
{
  "ok": true,
  "message": "connected",
  "spreadsheetId": "...",
  "spreadsheetUrl": "...",
  "sheetName": "Transactions"
}
```

ให้เปิด `spreadsheetUrl` เพื่อตรวจว่า Google Sheet ถูกสร้างแล้ว

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

ใช้คำสั่งนี้ใน VS Code Terminal

```bash
git add .
git commit -m "update expense app with auto sheet setup"
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

## วิธีใช้งานจริง

1. เปิดเว็บผ่านมือถือ
2. กด `+ เพิ่มรายการ`
3. เลือก `รายจ่าย` หรือ `รายรับ`
4. ใส่จำนวนเงิน
5. เลือกหมวดหมู่
6. เลือกวันที่
7. ใส่บันทึกเพิ่มเติมถ้าต้องการ
8. กด `บันทึก`
9. ดูยอดรวมที่หน้าแรก รายการย้อนหลังที่หน้า `รายการ` และกราฟที่หน้า `สรุป`

## วิธีแก้ไขรายการ

1. ไปที่หน้า `รายการ` หรือแตะรายการล่าสุดจากหน้าแรก
2. แตะรายการที่ต้องการแก้ไข
3. แก้ข้อมูล
4. กด `บันทึก`

## วิธีลบรายการ

1. แตะรายการที่ต้องการลบ
2. กด `ลบรายการนี้`
3. ยืนยันการลบ

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

เว็บเรียก Apps Script ด้วย JSONP เพื่อให้ใช้งานจาก GitHub Pages ได้ง่ายและลดปัญหา CORS

## การตั้งค่า Token

Token ในระบบนี้ใช้สำหรับกันการเรียก API แบบเปิดเผยทั่วไป แต่ไม่ใช่ระบบความปลอดภัยระดับสูง เพราะเว็บฝั่ง GitHub Pages เป็น frontend ที่ผู้ใช้สามารถดูโค้ดได้

เหมาะกับการใช้งานส่วนตัวตามโจทย์ของเว็บนี้

คำแนะนำ:

- ตั้ง token เป็นข้อความยาวพอสมควร
- ไม่ใช้ token ที่ซ้ำกับรหัสผ่านสำคัญ
- ถ้าคิดว่ามีคนรู้ token ให้เปลี่ยน token ทั้งใน `Code.gs` และ `script.js`
- หลังแก้ `Code.gs` ต้อง Deploy version ใหม่

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

มี 2 วิธี

วิธีที่ 1: เปิด setup URL

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?action=setup&token=my-secret-token-123
```

แล้วคัดลอกค่า `spreadsheetUrl`

วิธีที่ 2: ดูใน Apps Script Properties

1. เปิด Apps Script
2. เข้า Project Settings
3. ดู Script Properties
4. ค่าที่ระบบบันทึกไว้คือ
   - `SPREADSHEET_ID`
   - `SPREADSHEET_URL`

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
- Token อยู่ใน frontend จึงไม่ควรใช้เป็นรหัสผ่านสำคัญ

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

### เปลี่ยนข้อความในเว็บ

ข้อความส่วนใหญ่ถูกสร้างใน `script.js` ผ่านฟังก์ชัน `renderHome`, `renderAdd`, `renderList`, และ `renderSummary`

## บันทึกการเปลี่ยนแปลงล่าสุด

### v1.1.0

- เพิ่มไฟล์ `Code.gs` แยกในชุด zip
- Apps Script สร้าง Google Sheet ให้อัตโนมัติ
- Apps Script เก็บ `SPREADSHEET_ID` และ `SPREADSHEET_URL` ใน Script Properties
- หน้าเว็บฝัง Apps Script URL และ Token ผ่าน `CONFIG` ใน `script.js`
- เอาหน้าตั้งค่า Apps Script URL ออกจาก UI
- ใช้ JSONP สำหรับเรียก Apps Script จาก GitHub Pages

### v1.0.0

- เพิ่ม UI ภาษาไทยแบบ mobile-first
- เพิ่มหน้าแรก เพิ่มรายการ รายการ และสรุป
- เพิ่มการบันทึกข้อมูลในเครื่องผ่าน localStorage
- เพิ่มการเชื่อมต่อ Google Sheet ผ่าน Apps Script
