  import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `أنت معلّمة خاصة ذكية ومتحمّسة اسمك "هناء". مهمتك مساعدة الطلاب والشباب على التعلّم بطريقة ممتعة وفعّالة. قواعدك: اشرح المواضيع بأسلوب بسيط، اطرح سؤالاً للاختبار، صحّح بلطف، استخدم رموز تعبيرية، تكلّم بالعربية دائماً، كن محفّزاً.`;

const subjects = [
  { id: "math", label: "رياضيات", icon: "∑", color: "#f59e0b" },
  { id: "science", label: "علوم", icon: "⚗", color: "#10b981" },
  { id: "history", label: "تاريخ", icon: "📜", color: "#8b5cf6" },
  { id: "language", label: "لغة عربية", icon: "ق", color: "#ef4444" },
  { id: "english", label: "إنجليزية", icon: "A", color: "#3b82f6" },
  { id: "other", label: "أخرى", icon: "✦", color: "#ec4899" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [started, setStarted] = useState(false);
  const [xp, setXp] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`${SYSTEM_PROMPT}\nالمادة: ${selectedSubject.label}\n\n${input}`);
      setMessages((prev) => [...prev, { role: "assistant", content: result.response.text() }]);
      setXp((x) => x + 10);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "عذراً، حدث خطأ. تأكدي من إعداد المفتاح." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!started) return (
    <div style={{...styles.wrapper, flexDirection: "column"}}>
      <h1 style={{color:"#fff"}}>مرحباً بكِ في تطبيق هناء</h1>
      <div style={styles.subjectGrid}>{subjects.map(s => (
        <button key={s.id} style={styles.subjectBtn} onClick={() => { setSelectedSubject(s); setStarted(true); setMessages([{role:"assistant", content:"أهلاً! ما الموضوع الذي تريدين تعلمه؟"}]); }}>
          <div style={{color: s.color, fontSize:24}}>{s.icon}</div>
          <div>{s.label}</div>
        </button>
      ))}</div>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.chatContainer}>
        <div style={styles.messages}>{messages.map((m, i) => <div key={i} style={{color:"#fff", margin:10}}>{m.content}</div>)}</div>
        <div style={styles.inputArea}>
          <input value={input} onChange={(e) => setInput(e.target.value)} style={styles.textarea} />
          <button onClick={sendMessage} style={styles.sendBtn}>إرسال</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", background: "#080c14", display: "flex", alignItems: "center", justifyContent: "center", direction: "rtl" },
  subjectGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  subjectBtn: { padding: 20, borderRadius: 15, border: "none", cursor: "pointer" },
  chatContainer: { width: "100%", maxWidth: 600, background: "#0d1117", height: "80vh", display: "flex", flexDirection: "column" },
  messages: { flex: 1, overflowY: "auto" },
  inputArea: { display: "flex", padding: 10 },
  textarea: { flex: 1, padding: 10 },
  sendBtn: { padding: 10, cursor: "pointer" }
};
