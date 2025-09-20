# 🚀 FCM API Server

API เล็ก ๆ สำหรับส่ง **Firebase Cloud Messaging (FCM)** ไปยังอุปกรณ์ที่ใช้ Flutter/Android/iOS  
สามารถใช้ยิงจาก **Postman / cURL / Node-RED** ได้ทันที

---

## 📌 วิธีติดตั้ง & รัน

1. ไปที่โฟลเดอร์โปรเจค
   ```bash
   cd fcm-api
   ```

2. ติดตั้ง dependencies
   ```bash
   npm install
   ```

3. รัน server ด้วย Node.js
   ```bash
   node index.js
   ```

   ถ้าสำเร็จ จะเห็นข้อความ:
   ```
   🚀 FCM API running on http://localhost:3000
   ```

4. (แนะนำ) ใช้ nodemon เพื่อ auto restart เวลาแก้โค้ด
   ```bash
   npm install -g nodemon
   nodemon index.js
   ```

---

## 📌 การตั้งค่า Environment (.env)

สร้างไฟล์ `.env` ใน root ของโปรเจค แล้วใส่ค่าแบบนี้:

```env
KEY_FILE_NAME=panwarin-notifications-service.json
PROJECT_ID=panwarin-notifications
```

- `KEY_FILE_NAME` = path ไปยังไฟล์ Service Account JSON ของ Firebase  
- `PROJECT_ID` = Firebase Project ID ของคุณ  

👉 อย่าลืมเพิ่มไฟล์ `.env` และไฟล์ service account `.json` ลงใน `.gitignore`

---

## 📌 การใช้งาน API

### Endpoint: `POST /send-alert`

- URL: `http://localhost:3000/send-alert`  
- Method: `POST`  
- Headers:
  ```http
  Content-Type: application/json
  ```
- Body (JSON):
  ```json
  {
    "token": "DEVICE_FCM_TOKEN",
    "title": "🚨 Emergency",
    "body": "ห้อง 1 มอเตอร์โอเวอร์โหลด!",
    "data": {
      "alert_type": "emergency",
      "room_name": "ห้อง 1"
    }
  }
  ```

### ตัวอย่าง cURL
```bash
curl -X POST http://localhost:3000/send-alert \
  -H "Content-Type: application/json" \
  -d '{
    "token": "DEVICE_FCM_TOKEN",
    "title": "🚨 Emergency",
    "body": "ห้อง 1 มอเตอร์โอเวอร์โหลด!",
    "data": { "alert_type": "emergency", "room_name": "ห้อง 1" }
  }'
```

📌 โดย `DEVICE_FCM_TOKEN` = ค่า token ที่ได้จาก Flutter (`FirebaseMessaging.instance.getToken()`)

---

## 📌 ตัวอย่าง Response

ถ้า success จะได้ผลลัพธ์:
```json
{
  "success": true,
  "result": {
    "name": "projects/panwarin-notifications/messages/0:1756301120149663%5771be285771be28"
  }
}
```

---

## 📌 การใช้งานร่วมกับ Node-RED

- ใช้ **HTTP Request Node** ใน Node-RED  
- ตั้งค่า Method = `POST`  
- ใส่ URL = `http://<server-ip>:3000/send-alert`  
- Body → ใส่ JSON ตาม format ด้านบน (`token`, `title`, `body`, `data`)

---

## ✅ Notes
- ต้องมี **Service Account JSON** ของ Firebase  
- ตั้งค่า environment variables (`KEY_FILE_NAME`, `PROJECT_ID`) ให้ถูกต้อง  
- อย่าลืมเก็บไฟล์ `.json` และ `.env` ไว้ใน `.gitignore` เพื่อความปลอดภัย  
