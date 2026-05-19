import { useState } from "react";
import axios from "axios";

export default function Chatbot() {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào 👋 Tôi là Ford AI Assistant" }
  ]);

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setMessages(prev => [...prev, userMsg]);

    try {

      const res = await axios.post(
        "https://YOUR_BACKEND_URL/api/chat",
        {
          message,
          userId: "user_1"
        }
      );

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: res.data.reply }
      ]);

    } catch (err) {

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Lỗi kết nối server" }
      ]);
    }

    setMessage("");
  };

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}:</b> {m.text}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}