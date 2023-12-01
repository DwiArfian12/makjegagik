const axios = require("axios");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "client-one",
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
});

client.on("authenticated", (session) => {
  console.log(session);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("*MakBOT wes siap!*");
  client.sendMessage("secret@c.us", "*MakBOT wes siap!*");
  setInterval(checkSensorCondition, 2000);
});

client.on("message", async (msg) => {
  if (msg.body === "/status") {
    client.sendMessage(msg.from, "MakBOT aktif cuy!");
  }
  if (msg.body === "/mute") {
    await updateBuzzerSound("mute");
    client.sendMessage(msg.from, "Buzzer dinonaktifkan!");
  }

  if (msg.body === "/unmute") {
    await updateBuzzerSound("unmute");
    client.sendMessage(msg.from, "Buzzer diaktifkan!");
  }
  if (msg.body === "/notif-off") {
    await updateNotifCondition("off");
    client.sendMessage(msg.from, "Notif dinonaktifkan!");
  }

  if (msg.body === "/notif-on") {
    await updateNotifCondition("on");
    client.sendMessage(msg.from, "Notif diaktifkan!");
  }
  if (msg.body.startsWith("/add ")) {
    const commandParts = msg.body.split(" ");
    const numberToAdd = commandParts[1];
  
    if (numberToAdd) {
      try {
        await addNumber(numberToAdd);
        client.sendMessage(msg.from, `Number ${numberToAdd} added to the database!`);
      } catch (error) {
        console.error("Error adding number to the database:", error.message);
        client.sendMessage(msg.from, "Error adding number to the database.");
      }
    } else {
      client.sendMessage(msg.from, "Please provide a number to add.");
    }
  }
  
});

client.initialize();

async function checkSensorCondition() {
  try {
    const response = await axios.get(
      "secret/sensor/condition.json"
    );
    const condition = response.data;

    console.log("Sensor Condition:", condition);

    if (condition === 0) {
      await checkNotifCondition();
    }
  } catch (error) {
    console.error("Error checking sensor condition:", error.message);
  }
}

async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    await client.sendMessage(`${phoneNumber}@c.us`, message);
    console.log("Message sent:", message);
  } catch (error) {
    console.error("Error sending message:", error.message);
  }
}

async function updateBuzzerSound(sound) {
  try {
    const response = await axios.put(
      "secret/buzzer.json",
      {
        sound: sound,
      }
    );

    console.log("Buzzer sound updated:", sound);
  } catch (error) {
    console.error("Error updating buzzer sound:", error.message);
  }
}
async function updateNotifCondition(status) {
  try {
    const response = await axios.put(
      "secret/msg.json",
      {
        status: status,
      }
    );

    console.log("Notif condition updated:", status);
  } catch (error) {
    console.error("Error updating Notif condition:", error.message);
  }
}

async function checkNotifCondition() {
  try {
    const response = await axios.get(
      "secret/msg.json"
    );

    const msgStatus = response.data.status;

    if (msgStatus === "on") {
      await checkNumberPhone();
    }

  } catch (error) {
    console.error("Error checking notification status:", error.message);
  }
}

async function checkNumberPhone() {
  try {
    const response = await axios.get(
      "secret/user.json"
    );

    const numbers = Object.values(response.data);

    if (numbers && numbers.length > 0) {
      for (const entry of numbers) {
        const phoneNumber = entry.no;
        const message = "HUJAAANNN!!!";
        await sendWhatsAppMessage(phoneNumber, message);
      }
    }

  } catch (error) {
    console.error("Error sending to Numbers:", error.message);
  }
} 

async function addNumber(number) {
  try {
    const response = await axios.post("secret/user.json", {
      no: number
    });

    if (response.status === 200) {
      console.log(`Number ${number} added successfully.`);
    } else {
      console.error(`Failed to add number ${number}.`);
    }
  } catch (error) {
    console.error("Error adding number to the database:", error.message);
    throw error; 
  }
}
