import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const QUICK_ACTIONS = [
  { label: "🌊 Flood Emergency", msg: "There is a flood, what should I do immediately?" },
  { label: "🌎 Earthquake", msg: "An earthquake is happening, what are the immediate steps?" },
  { label: "🔥 Fire Emergency", msg: "There is a fire, what should I do?" },
  { label: "🆘 Emergency Numbers", msg: "Give me all emergency contact numbers" },
  { label: "🏠 Safe Shelter", msg: "How do I find a safe shelter nearby?" },
  { label: "🩺 Medical Help", msg: "What to do in a medical emergency?" },
];

const EMERGENCY_CONTACTS = [
  { name: "National Emergency", number: "112", color: "#dc3545" },
  { name: "Ambulance", number: "108", color: "#198754" },
  { name: "NDRF", number: "011-24363260", color: "#0d6efd" },
  { name: "Flood Control", number: "1070", color: "#0dcaf0" },
];

export default function ChatBot() {
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState("chat"); // "chat" | "emergency"
  const [messages, setMessages] = useState([
    { from: "bot", text: "🚨 Emergency Response Assistant ready!\n\nI can guide you through any disaster situation. Use the quick actions below or type your question." },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const historyRef            = useRef([]);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages((m) => [...m, { from: "user", text: msg }]);
    setInput("");
    setLoading(true);
    setTab("chat");
    historyRef.current.push({ role: "user", content: msg });
    try {
      const { data } = await axios.post(`${API}/chat`, {
        message: msg,
        history: historyRef.current.slice(-8),
      });
      setMessages((m) => [...m, { from: "bot", text: data.reply }]);
      historyRef.current.push({ role: "assistant", content: data.reply });
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "⚠️ Server se connect nahi ho paya. Emergency mein 112 call karein!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => e.key === "Enter" && !e.shiftKey && send();

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setOpen((o) => !o)} style={s.fab} title="Emergency Assistant">
        {open ? "✕" : "🚨"}
      </button>

      {open && (
        <div style={s.window}>
          {/* Header */}
          <div style={s.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={s.headerIcon}>🛡️</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Emergency Response AI</div>
                <div style={{ fontSize: 11, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
                  Online • Powered by Gemini AI
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={s.closeBtn}>✕</button>
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            {["chat", "emergency"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
                {t === "chat" ? "💬 Chat" : "🆘 Emergency"}
              </button>
            ))}
          </div>

          {/* CHAT TAB */}
          {tab === "chat" && (
            <>
              {/* Quick Actions */}
              <div style={s.quickActions}>
                {QUICK_ACTIONS.map((q) => (
                  <button key={q.label} onClick={() => send(q.msg)} style={s.quickBtn}>
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div style={s.body}>
                {messages.map((m, i) => (
                  <div key={i} style={m.from === "user" ? s.userMsg : s.botMsg}>
                    {m.from === "bot" && <div style={s.botAvatar}>🤖</div>}
                    <div style={m.from === "user" ? s.userBubble : s.botBubble}>
                      {m.text.split("\n").map((line, j) => (
                        <span key={j}>{line}{j < m.text.split("\n").length - 1 && <br />}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={s.botMsg}>
                    <div style={s.botAvatar}>🤖</div>
                    <div style={{ ...s.botBubble, display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#0d6efd", display: "inline-block", animation: `bounce 1s ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={s.footer}>
                <input
                  style={s.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Describe your emergency situation..."
                  disabled={loading}
                />
                <button style={{ ...s.sendBtn, opacity: loading ? 0.6 : 1 }} onClick={() => send()} disabled={loading}>
                  ➤
                </button>
              </div>
            </>
          )}

          {/* EMERGENCY TAB */}
          {tab === "emergency" && (
            <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, letterSpacing: 1 }}>📞 EMERGENCY CONTACTS</div>
                {EMERGENCY_CONTACTS.map((c) => (
                  <a key={c.name} href={`tel:${c.number}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-main)", border: `1px solid var(--border-color)`, borderLeft: `4px solid ${c.color}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, textDecoration: "none" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</span>
                    <span style={{ fontWeight: 800, color: c.color, fontSize: 15 }}>{c.number}</span>
                  </a>
                ))}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8, letterSpacing: 1 }}>⚡ QUICK EMERGENCY GUIDE</div>
                {[
                  { icon: "🌊", title: "Flood", steps: ["Move to higher ground", "Turn off electricity", "Call 112"] },
                  { icon: "🌎", title: "Earthquake", steps: ["Drop, Cover, Hold On", "Stay away from windows", "Do not run outside"] },
                  { icon: "🔥", title: "Fire", steps: ["Call 101", "Crawl low under smoke", "Do not use elevator"] },
                ].map((item) => (
                  <div key={item.title} style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 6 }}>{item.icon} {item.title}</div>
                    {item.steps.map((step, i) => (
                      <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 6, marginBottom: 3 }}>
                        <span style={{ color: "#dc3545", fontWeight: 700 }}>{i + 1}.</span> {step}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button onClick={() => { setTab("chat"); send("Give me a complete emergency safety checklist"); }}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#dc3545,#7b0d1e)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                🤖 Get Full Emergency Guide from AI
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}

const s = {
  fab: {
    position: "fixed", bottom: 24, right: 24, zIndex: 9999,
    width: 58, height: 58, borderRadius: "50%", border: "none",
    background: "linear-gradient(135deg,#dc3545,#7b0d1e)", color: "#fff", fontSize: 24,
    cursor: "pointer", boxShadow: "0 4px 20px rgba(220,53,69,0.5)",
    transition: "all 0.3s",
  },
  window: {
    position: "fixed", bottom: 92, right: 24, zIndex: 9998,
    width: 360, height: 540, borderRadius: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    display: "flex", flexDirection: "column",
    background: "var(--chatbot-bg)", overflow: "hidden",
    border: "1px solid var(--border-color)",
  },
  header: {
    background: "linear-gradient(135deg,#dc3545,#7b0d1e)", color: "#fff",
    padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
  },
  closeBtn: {
    background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
    width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 12,
  },
  tabs: {
    display: "flex", borderBottom: "1px solid var(--border-color)",
    background: "var(--chatbot-bg)",
  },
  tab: {
    flex: 1, padding: "9px", border: "none", background: "transparent",
    color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  tabActive: {
    color: "#dc3545", borderBottom: "2px solid #dc3545", background: "transparent",
  },
  quickActions: {
    display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px",
    borderBottom: "1px solid var(--border-color)", background: "var(--chatbot-bg)",
  },
  quickBtn: {
    padding: "4px 10px", borderRadius: 20, border: "1px solid var(--border-color)",
    background: "var(--bg-main)", color: "var(--text-primary)", fontSize: 11,
    cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap",
  },
  body: {
    flex: 1, overflowY: "auto", padding: "12px",
    display: "flex", flexDirection: "column", gap: 10,
    background: "var(--chatbot-body)",
  },
  botMsg:  { display: "flex", gap: 8, alignItems: "flex-end" },
  userMsg: { display: "flex", justifyContent: "flex-end" },
  botAvatar: { width: 28, height: 28, borderRadius: "50%", background: "rgba(13,110,253,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 },
  botBubble: {
    background: "var(--chatbot-bot-msg)", color: "var(--chatbot-bot-text)",
    borderRadius: "12px 12px 12px 0", padding: "9px 13px",
    maxWidth: "82%", fontSize: 13, lineHeight: 1.6,
  },
  userBubble: {
    background: "linear-gradient(135deg,#dc3545,#7b0d1e)", color: "#fff",
    borderRadius: "12px 12px 0 12px", padding: "9px 13px",
    maxWidth: "82%", fontSize: 13, lineHeight: 1.6,
  },
  footer: {
    display: "flex", borderTop: "1px solid var(--border-color)", padding: 10, gap: 8,
    background: "var(--chatbot-bg)",
  },
  input: {
    flex: 1, border: "1px solid var(--input-border)", borderRadius: 10,
    padding: "8px 12px", fontSize: 13, outline: "none",
    background: "var(--bg-input)", color: "var(--text-primary)",
  },
  sendBtn: {
    background: "linear-gradient(135deg,#dc3545,#7b0d1e)", color: "#fff", border: "none",
    borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 16, fontWeight: 700,
  },
};
