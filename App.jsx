import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `أنت معلّمة خاصة ذكية ومتحمّسة اسمك "هناء". مهمتك مساعدة الطلاب والشباب على التعلّم بطريقة ممتعة وفعّالة.

قواعدك:
1. اشرح المواضيع بأسلوب بسيط وواضح مع أمثلة من الحياة اليومية
2. بعد كل شرح، اطرح سؤالاً واحداً لاختبار الفهم
3. إذا أجاب الطالب، صحّح بلطف وشجّعه دائماً
4. استخدم رموز تعبيرية لجعل الشرح أكثر متعة
5. تكلّم بالعربية دائماً
6. إذا طُلب منك موضوع جديد، اشرحه بشكل منظّم (تعريف → أمثلة → تطبيق)
7. كن محفّزاً ومشجّعاً في كل وقت`;

const subjects = [
  { id: "math", label: "رياضيات", icon: "∑", color: "#f59e0b" },
  { id: "science", label: "علوم", icon: "⚗", color: "#10b981" },
  { id: "history", label: "تاريخ", icon: "📜", color: "#8b5cf6" },
  { id: "language", label: "لغة عربية", icon: "ق", color: "#ef4444" },
  { id: "english", label: "إنجليزية", icon: "A", color: "#3b82f6" },
  { id: "other", label: "أخرى", icon: "✦", color: "#ec4899" },
];

export default function TutorAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [started, setStarted] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startSession = (subject) => {
    setSelectedSubject(subject);
    setStarted(true);
    const welcome = {
      role: "assistant",
      content: `مرحباً! أنا **هناء**، معلّمتك الخاصة 🌟\n\nاخترت مادة **${subject.label}** — رائع! أنا هنا لأشرح لك أي موضوع تريده، وأختبر فهمك، وأصحّح معك خطوة بخطوة.\n\nما الموضوع الذي تريد تعلّمه اليوم؟ 📚`,
    };
    setMessages([welcome]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + `\n\nالمادة الحالية: ${selectedSubject?.label}`,
          messages: apiMessages,
        }),
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || "عذراً، حدث خطأ.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setXp((x) => x + 10);
      setStreak((s) => s + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const xpLevel = Math.floor(xp / 50) + 1;
  const xpProgress = (xp % 50) / 50;

  const renderMessage = (content) => {
    return content.split("\n").map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <p key={i} dangerouslySetInnerHTML={{ __html: boldLine }}
          style={{ margin: "2px 0", lineHeight: 1.7 }} />
      );
    });
  };

  if (!started) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.landing}>
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>هناء</div>
            <h1 style={styles.title}>معلّمتك الخاصة بالذكاء الاصطناعي</h1>
            <p style={styles.subtitle}>اشرح • اختبر • صحّح — في أي مادة تريدها</p>
          </div>
          <div style={styles.featureRow}>
            {[
              { icon: "💡", text: "شرح مبسّط وواضح" },
              { icon: "❓", text: "اختبارات فورية" },
              { icon: "✅", text: "تصحيح وتشجيع" },
            ].map((f, i) => (
              <div key={i} style={styles.featureChip}>
                <span>{f.icon}</span>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{f.text}</span>
              </div>
            ))}
          </div>
          <p style={styles.chooseLabel}>اختر المادة للبدء</p>
          <div style={styles.subjectGrid}>
            {subjects.map((s) => (
              <button key={s.id} style={{ ...styles.subjectBtn }}
                onClick={() => startSession(s)}>
                <div style={{ ...styles.subjectIcon, color: s.color }}>{s.icon}</div>
                <div style={styles.subjectLabel}>{s.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.chatContainer}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ ...styles.subjectDot, background: selectedSubject.color }} />
            <div>
              <div style={styles.headerTitle}>هناء — {selectedSubject.label}</div>
              <div style={styles.headerSub}>معلّمتك الخاصة</div>
            </div>
          </div>
          <div style={styles.xpArea}>
            <div style={styles.xpLabel}>
              <span style={{ color: "#f59e0b" }}>★ المستوى {xpLevel}</span>
              <span style={{ color: "#64748b", fontSize: 11 }}>{xp} XP</span>
            </div>
            <div style={styles.xpBar}>
              <div style={{ ...styles.xpFill, width: `${xpProgress * 100}%` }} />
            </div>
          </div>
          <button style={styles.backBtn}
            onClick={() => { setStarted(false); setMessages([]); setSelectedSubject(null); }}>
            ← تغيير
          </button>
        </div>
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ ...styles.msgRow,
              flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              {msg.role === "assistant" && <div style={styles.avatar}>ه</div>}
              <div style={{ ...styles.bubble,
                ...(msg.role === "user" ? styles.userBubble : styles.aiBubble) }}>
                {renderMessage(msg.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msgRow, flexDirection: "row" }}>
              <div style={styles.avatar}>ه</div>
              <div style={{ ...styles.bubble, ...styles.aiBubble, ...styles.typingBubble }}>
                <span style={styles.dot} />
                <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {messages.length === 1 && (
          <div style={styles.quickRow}>
            {["اشرح لي موضوعاً", "اختبرني", "أعطني مثالاً"].map((q, i) => (
              <button key={i} style={styles.quickBtn}
                onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}>
                {q}
              </button>
            ))}
          </div>
        )}
        <div style={styles.inputArea}>
          <textarea ref={inputRef} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="اكتب سؤالك أو الموضوع الذي تريد تعلّمه..."
            style={styles.textarea} rows={1} />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            style={{ ...styles.sendBtn, opacity: !input.trim() || loading ? 0.4 : 1,
              background: selectedSubject.color }}>↑</button>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        textarea { font-family: 'IBM Plex Sans Arabic', sans-serif; resize: none; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", background: "#080c14", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontFamily: "'IBM Plex Sans Arabic', sans-serif", direction: "rtl", padding: "16px" },
  landing: { width: "100%", maxWidth: 520, animation: "fadeUp 0.6s ease" },
  logoArea: { textAlign: "center", marginBottom: 36 },
  logoIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 72, height: 72, borderRadius: 20,
    background: "linear-gradient(135deg, #f59e0b, #ef4444)", fontSize: 16,
    fontWeight: 700, color: "#fff", marginBottom: 16, boxShadow: "0 0 40px #f59e0b44" },
  title: { fontSize: 26, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748b" },
  featureRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" },
  featureChip: { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
    borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 13 },
  chooseLabel: { textAlign: "center", color: "#475569", fontSize: 12,
    textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 },
  subjectGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  subjectBtn: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "20px 10px", cursor: "pointer", transition: "all 0.2s ease",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  subjectIcon: { fontSize: 24, fontWeight: 700, lineHeight: 1 },
  subjectLabel: { fontSize: 13, color: "#94a3b8", fontWeight: 500 },
  chatContainer: { width: "100%", maxWidth: 640, height: "92vh", display: "flex",
    flexDirection: "column", background: "#0d1117", borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)" },
  header: { padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  subjectDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  headerTitle: { fontSize: 14, fontWeight: 600, color: "#f1f5f9" },
  headerSub: { fontSize: 11, color: "#475569" },
  xpArea: { display: "flex", flexDirection: "column", gap: 4, minWidth: 90 },
  xpLabel: { display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 },
  xpBar: { height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" },
  xpFill: { height: "100%", background: "linear-gradient(90deg, #f59e0b, #ef4444)",
    borderRadius: 2, transition: "width 0.5s ease" },
  backBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, color: "#64748b", fontSize: 12, padding: "5px 10px", cursor: "pointer" },
  messages: { flex: 1, overflowY: "auto", padding: "20px 16px",
    display: "flex", flexDirection: "column", gap: 14 },
  msgRow: { display: "flex", gap: 10, alignItems: "flex-end", animation: "fadeUp 0.3s ease" },
  avatar: { width: 32, height: 32, borderRadius: 10,
    background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 13,
    fontWeight: 700, color: "#fff", flexShrink: 0 },
  bubble: { maxWidth: "80%", padding: "12px 16px", borderRadius: 16, fontSize: 14, lineHeight: 1.7 },
  aiBubble: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#cbd5e1", borderBottomRightRadius: 4 },
  userBubble: { background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    color: "#fff", borderBottomLeftRadius: 4 },
  typingBubble: { display: "flex", gap: 4, alignItems: "center", padding: "14px 18px" },
  dot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%",
    background: "#64748b", animation: "bounce 1.2s infinite" },
  quickRow: { display: "flex", gap: 8, padding: "0 16px 12px", flexWrap: "wrap" },
  quickBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20, color: "#94a3b8", fontSize: 12, padding: "6px 14px", cursor: "pointer" },
  inputArea: { padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,0.02)" },
  textarea: { flex: 1, background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px",
    color: "#f1f5f9", fontSize: 14, outline: "none", lineHeight: 1.5,
    maxHeight: 120, overflowY: "auto" },
  sendBtn: { width: 40, height: 40, borderRadius: 12, border: "none", color: "#fff",
    fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", transition: "all 0.2s", fontWeight: 700, flexShrink: 0 },
};
