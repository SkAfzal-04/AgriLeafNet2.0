import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi 👋 How can I help you?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const [lang, setLang] = useState("en");
 
  const recognitionRef = useRef(null);
 
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
 
    if (!SpeechRecognition) return;
 
    const recognition = new SpeechRecognition();
 
    recognition.continuous = true;
 
    recognition.lang =
      lang === "hi"
        ? "hi-IN"
        : lang === "bn"
        ? "bn-IN"
        : lang === "es"
        ? "es-ES"
        : lang === "fr"
        ? "fr-FR"
        : lang === "de"
        ? "de-DE"
        : lang === "zh"
        ? "zh-CN"
        : "en-US";
 
    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      setInput(text);
    };
 
    recognition.onerror = () => setListening(false);
 
    recognition.onend = () => {
      console.log("Stopped manually");
    };
 
    recognitionRef.current = recognition;
  }, [lang]);
 
  // 🎤 START
  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech not supported");
      return;
    }
 
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.log("Already started");
    }
  };
 
  // ⏹ STOP
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };
 
  // 🧹 CLEAR CHAT
  const clearChat = () => {
    setMessages([
      { text: "Hi 👋 How can I help you?", sender: "bot" }
    ]);
  };
 
  // 💾 SAVE CHAT TO BACKEND
  const saveChat = async (userMsg, botReply) => {
    const user_id = localStorage.getItem("user_id");
 
    if (!user_id) return;
 
    try {
      await fetch(`${BASE_URL}/save-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id,
          message: userMsg,
          reply: botReply,
          lang
        })
      });
    } catch (err) {
      console.log("Save error", err);
    }
  };
 
  // 🔥 SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;
 
    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
 
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMsg.text,
          lang: lang
        })
      });
 
      const data = await res.json();
 
      const botReply = {
        text: data.reply || "Sorry, I couldn't understand.",
        sender: "bot"
      };
 
      setMessages((prev) => [...prev, botReply]);
 
      // 💾 SAVE CHAT
      saveChat(userMsg.text, botReply.text);
 
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: "Server error. Please try again.", sender: "bot" }
      ]);
    }
 
    setLoading(false);
  };
 
  // 📥 DOWNLOAD HISTORY
  const downloadHistory = async () => {
    const user_id = localStorage.getItem("user_id");
 
    if (!user_id) {
      alert("Login required");
      return;
    }
 
    try {
      const res = await fetch(
        `${BASE_URL}/get-history/${user_id}`
      );
      const data = await res.json();
 
      if (!data.length) {
        alert("No chat history found");
        return;
      }
 
      let text = "AgriLeafNet Chat History\n\n";
 
      data.forEach((item) => {
        text += `User: ${item.message}\n`;
        text += `Bot: ${item.reply}\n\n`;
      });
 
      const blob = new Blob([text], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
 
      const a = document.createElement("a");
      a.href = url;
      a.download = "chat-history.txt";
      a.click();
 
    } catch (err) {
      console.log(err);
      alert("Download failed");
    }
  };
 
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl"
      >
        💬
      </button>
 
      {/* Chat Window */}
      {open && (
        <motion.div
          className="fixed bottom-20 right-6 w-[420px] bg-white rounded-xl shadow-2xl z-50 flex flex-col"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="bg-green-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <span>Agri Assistant 🌱</span>
 
            <div className="flex items-center gap-2">
 
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="text-black text-sm rounded px-2 py-1"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
 
              {/* 🧹 CLEAR */}
              <button
                onClick={clearChat}
                className="bg-white text-red-600 px-2 py-1 rounded text-xs hover:bg-gray-200"
              >
                Clear
              </button>
 
              {/* DOWNLOAD */}
              <button
                onClick={downloadHistory}
                className="bg-white text-green-700 px-2 py-1 rounded text-xs"
              >
                ⬇
              </button>
 
              <button onClick={() => setOpen(false)}>✖</button>
 
            </div>
          </div>
 
          {/* Messages */}
          <div className="p-3 h-[400px] overflow-y-auto space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-green-100 ml-auto"
                    : "bg-gray-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
 
            {loading && (
              <div className="text-gray-500 text-sm">Typing...</div>
            )}
          </div>
 
          {/* Input */}
          <div className="flex items-center border-t p-2 gap-2">
            <input
              type="text"
              className="flex-1 p-2 outline-none"
              placeholder="Type or speak..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
 
            <button
              onClick={() => {
                if (listening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                listening
                  ? "bg-red-500 animate-pulse"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {listening ? "⏹" : "🎤"}
            </button>
 
            <button
              onClick={sendMessage}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}