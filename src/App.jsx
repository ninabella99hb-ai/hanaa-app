        import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startSession = (subject) => {
    setSelectedSubject(subject);
    setStarted(true);
    setMessages([{
      role: "assistant",
      content: `مرحباً! أنا **هناء**، معلّمتك الخاصة 🌟\n\nاخترت مادة **${subject.label}** — رائع! أنا هنا لأشرح لك أي موضوع تريده، وأختبر فهمك، وأصحّح معك خطوة بخطوة.`,
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // استخدام المفتاح الذي وضعتِه في Vercel
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const chat = model.startChat({
        history: newMessages.slice(0, -1).map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      });

      const result = await chat.sendMessage(`${SYSTEM_PROMPT}\nالمادة: ${selectedSubject.label}\n\n${input.trim()}`);
      setMessages(prev => [...prev, { role: "assistant", content: result.response.text() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ في الاتصال." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!started) return (
    <div style={{minHeight:"100vh", background:"#080c14", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"sans-serif"}}>
      <h1>مرحباً بكِ في تطبيق هناء</h1>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, padding:20}}>
        {subjects.map(s => <button key={s.id} onClick={() => startSession(s)}>{s.label}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{background:"#0d1117", minHeight:"100vh", color:"#fff", padding:20, fontFamily:"sans-serif"}}>
      <div style={{height:"70vh", overflowY:"auto", marginBottom:20}}>
        {messages.map((m, i) => <p key={i} style={{marginBottom:10}}>{m.role === "user" ? "أنت: " : "هناء: "}{m.content}</p>)}
        <div ref={bottomRef} />
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} style={{width:"80%", padding:10}} />
      <button onClick={sendMessage} disabled={loading}>إرسال</button>
    </div>
  );
}
