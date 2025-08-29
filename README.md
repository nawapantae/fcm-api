##📌 วิธีรัน API

1. ไปที่โฟลเดอร์โปรเจคที่คุณสร้าง (fcm-api)

  cd fcm-api


2. รัน server ด้วย Node.js

  node index.js


3. ถ้าสำเร็จ จะเห็นข้อความใน terminal:

  🚀 FCM API running on http://localhost:3000


4. (ทางเลือก) ใช้ nodemon เพื่อให้ server auto restart เวลาแก้โค้ด

  npm install -g nodemon
  nodemon index.js


##วิธี นำไปใช้
📌 วิธีทดสอบ API

เปิดอีก terminal แล้วลองยิง curl:

curl -X POST http://localhost:3000/send-alert \
  -H "Content-Type: application/json" \
  -d '{
    "token": "DEVICE_FCM_TOKEN",
    "title": "🚨 Emergency",
    "body": "ห้อง 1 มอเตอร์โอเวอร์โหลด!",
    "data": { "alert_type": "emergency", "room_name": "ห้อง 1" }
  }'


DEVICE_FCM_TOKEN = token ที่คุณ print ได้จาก Flutter (ผ่าน FirebaseMessaging.instance.getToken())

ถ้า success จะได้ JSON ประมาณนี้:

{
  "success": true,
  "result": {
    "name": "projects/panwarin-notifications/messages/0:1756301120149663%5771be285771be28"
  }
}

📌 ถัดไป

ถ้าอยากให้ Node-RED ใช้งาน API นี้ → แค่ใช้ HTTP Request Node ของ Node-RED ยิงไปที่ http://<server-ip>:3000/send-alert

แล้วส่ง body ตาม format ที่เรากำหนด (token, title, body, data)
