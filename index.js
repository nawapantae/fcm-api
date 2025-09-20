require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

//init supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // แนะนำให้ใช้ service role key เพราะต้องดึงหลาย row
);

const app = express();
app.use(bodyParser.json());

// โหลด service account JSON
const auth = new GoogleAuth({
  keyFile: process.env.KEY_FILE_NAME,  // path ไปยังไฟล์ JSON ของคุณ
  scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
});

(async () => {
  console.log("SERVER projectId =", await auth.getProjectId());
})();

const PROJECT_ID = process.env.PROJECT_NAME; // ใส่ Project ID ของ Firebase
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

// ฟังก์ชันยิง notifire base
async function sendFcmMessage(token, title, body, data) {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const projectId = await auth.getProjectId();
  let sound = "new_notification.caf";

  if(data['alert_type'] == "manual") {
    title = "⚠️ Manual Mode";
    body = `${data["room_name"]} เปิด Manual`
  }

  if(data['alert_type'] == "limit_top") {
    title = "🔵 Limit Switch";
    body = `รอก${data["room_name"]} ถึงจุดสูงสุดแล้ว`
  }

  if(data['alert_type'] == "alert") {
    title = "🚨 ฉุกเฉิน!!";
    body = `${data["room_name"]} มีมอเตอร์โอเวอร์โหลด`;
    sound = "loud_emergency_short.caf";
  }

  const message = {
   "message":{
      "token": token,
      "data": data,
      "notification":{
        "title": title,
        "body": body,
      },
       "android": {
        "notification": {
          "sound": sound // 👈 raw/loud_emergency_alarm.wav
        }
      },
     "apns": {
      "headers": {
        "apns-push-type": "alert",
        "apns-priority": "10"
      },
      "payload": {
        "aps": {
          "sound": sound // มีนามสกุล
        }
      }
    }
   }
  };

  // console.log('message before send fcm : ', message);

  try {
    const res = await axios.post(FCM_ENDPOINT, message, {
      headers: {
        "Authorization": `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
    });
    // console.log('res : ', res);
    return res.status;
  } catch (error) {
    console.log('error send fcm : ',error);
    return error;
  }
}

//get token by Company
async function getFcmTokensByCompany(company_name) {
  const { data, error } = await supabase
    .from('user_devices')
    .select('fcm_token')
    .eq('company_name', company_name);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data.map(row => row.fcm_token); // return เป็น array ของ token
}


// สร้าง API endpoint
app.post("/send-alert", async (req, res) => {
  try {
    const { title, body, data, company_name } = req.body;

    const tokens = await getFcmTokensByCompany(company_name);

    //ถ้า token == 0
    if (tokens.length === 0) {
      return res.status(404).json({ success: false, message: "No devices found" });
    }

    console.log('token length : ' , tokens);

    for (const token of tokens) {
       await sendFcmMessage(token, title, body, data || {});
    }
    res.status(200).json({ success: true });

  } catch (err) {
    const raw = err.response?.data || err.message;
    console.error("FCM error raw:", JSON.stringify(raw, null, 2));

    const details = err.response?.data?.error?.details || [];
    const badReq = details.find(d => d['@type']?.includes('google.rpc.BadRequest'));
    if (badReq?.fieldViolations) {
      console.error("Field violations:", JSON.stringify(badReq.fieldViolations, null, 2));
    }

    return res.status(500).json({ success: false, error: err.message, raw });
  }
});

// run server
app.listen(3000, () => {
  console.log("🚀 FCM API running on http://localhost:3000");
});