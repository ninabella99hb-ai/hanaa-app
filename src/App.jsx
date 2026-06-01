             import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userText = input;
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(userText);
      const reply = await result.response.text();
      
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ. تأكدي من مفتاح API في Vercel." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>معلّمتك هناء 🌟</h1>
      <div style={{ height: "60vh", overflowY: "auto", border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
        {messages.map((m, i) => (
          <p key={i}><strong>{m.role === "user" ? "أنت: " : "هناء: "}</strong>{m.content}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} style={{ width: "70%", padding: 10 }} />
      <button onClick={sendMessage} disabled={loading} style={{ padding: 10 }}>إرسال</button>
    </div>
  );
}
