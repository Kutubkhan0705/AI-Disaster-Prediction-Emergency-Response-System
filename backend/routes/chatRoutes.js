import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const SYSTEM_PROMPT = `You are an Emergency Response AI Assistant for an AI Disaster Prediction & Alert System.

YOUR ROLE:
- Provide immediate, life-saving emergency guidance during disasters
- Give step-by-step safety instructions for floods, earthquakes, cyclones, landslides
- Share emergency contact numbers and shelter information
- Help users assess their risk level and take action

EMERGENCY CONTACTS (India):
- National Emergency: 112
- NDRF: 011-24363260
- Flood Control Room: 1070
- Fire: 101
- Ambulance: 108
- Police: 100
- Coast Guard: 1554

RESPONSE RULES:
1. Always prioritize life safety first
2. Give numbered step-by-step instructions
3. Always reply in ENGLISH only
4. Use emojis to make responses scannable
5. Keep responses concise but complete
6. For medical emergencies always say call 108 first

DISASTER PROTOCOLS:
FLOOD: Move to higher ground, avoid moving water, turn off electricity
EARTHQUAKE: Drop-Cover-Hold, stay away from windows, no elevators
CYCLONE: Stay indoors, stock food/water, follow evacuation orders
FIRE: RACE protocol (Rescue, Alarm, Contain, Extinguish/Evacuate)`;

const getFallbackReply = (message) => {
  const m = message.toLowerCase();
  if (m.includes("flood")) return "🌊 Flood Emergency Steps:\n1. Move to higher ground immediately\n2. Turn off electricity at the main switch\n3. Avoid walking in moving water\n4. Prepare emergency kit (water, food, torch)\n5. Call 112 for rescue";
  if (m.includes("earthquake")) return "🌎 Earthquake Emergency Steps:\n1. DROP to hands and knees\n2. Take COVER under a sturdy table\n3. HOLD ON until shaking stops\n4. Stay away from windows\n5. Do NOT use elevators\n6. Call 112 if injured";
  if (m.includes("fire")) return "🔥 Fire Emergency Steps:\n1. Call 101 immediately\n2. Activate the nearest fire alarm\n3. Crawl low under smoke\n4. Close doors to slow fire spread\n5. Do NOT use elevators";
  if (m.includes("number") || m.includes("contact") || m.includes("helpline")) return "📞 Emergency Contacts:\n🆘 National Emergency: 112\n🚑 Ambulance: 108\n🚒 Fire: 101\n👮 Police: 100\n🌊 Flood Control: 1070\n🏔️ NDRF: 011-24363260";
  if (m.includes("shelter")) return "🏠 Finding Safe Shelter:\n1. Go to nearest government school or community hall\n2. Call 112 for nearest shelter location\n3. Check the Live Map on this app\n4. Avoid low-lying areas and riverbanks";
  if (m.includes("medical") || m.includes("injured") || m.includes("hurt")) return "🩺 Medical Emergency:\n1. Call 108 (Ambulance) IMMEDIATELY\n2. Do not move a seriously injured person\n3. Apply pressure to stop bleeding\n4. Keep the person warm and calm";
  if (m.includes("cyclone") || m.includes("storm")) return "🌀 Cyclone Safety:\n1. Stay indoors away from windows\n2. Stock food, water and medicines\n3. Follow official evacuation orders\n4. Call 112 for emergency assistance";
  if (m.includes("hello") || m.includes("hi") || m.includes("hey")) return "👋 Hello! I am your Emergency Response Assistant.\n\nI can help you with:\n🌊 Flood safety\n🌎 Earthquake preparedness\n🔥 Fire emergency\n📞 Emergency contacts\n🏠 Safe shelters\n\nWhat do you need help with?";
  return "🤖 I am your Emergency Response Assistant.\n\nI can help with:\n• Flood, Earthquake, Fire, Cyclone emergencies\n• Emergency contact numbers\n• Safe shelter guidance\n• First aid steps\n\n📞 For immediate help call: 112";
};

router.post("/", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ reply: "Message required." });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: history.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err.message);
    const fallback = getFallbackReply(message);
    res.json({ reply: fallback });
  }
});

export default router;
