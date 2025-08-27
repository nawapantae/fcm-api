require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");


const app = express();
app.use(bodyParser.json());

// โหลด service account JSON
const auth = new GoogleAuth({
  keyFile: process.env.KEY_FILE_NAME,  // path ไปยังไฟล์ JSON ของคุณ
  scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
});

const PROJECT_ID = process.env.PROJECT_ID; // ใส่ Project ID ของ Firebase
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

// ฟังก์ชันยิง FCM
async function sendFcmMessage(token, title, body, data) {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const message = {
    message: {
      token,
      notification: { title, body },
      data,
    },
  };

  const res = await axios.post(FCM_ENDPOINT, message, {
    headers: {
      "Authorization": `Bearer ${accessToken.token}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
}

// สร้าง API endpoint
app.post("/send-alert", async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    const result = await sendFcmMessage(token, title, body, data || {});
   
    console.log('result : ', result);
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("Error sending FCM:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// run server
app.listen(3000, () => {
  console.log("🚀 FCM API running on http://localhost:3000");
});
