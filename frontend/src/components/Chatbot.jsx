import { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào 👋 Tôi là Ford AI Assistant",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://ford-admin.onrender.com/api/chat",
        {
          message: message,
        }
      );

      const reply = res.data?.reply;

      // xử lý nhiều dạng response
      let botMessages = [];

      if (Array.isArray(reply)) {
        botMessages = reply.map((r) => ({
          sender: "bot",
          text: r,
        }));
      } else {
        botMessages = [
          {
            sender: "bot",
            text: reply || "Không có phản hồi",
          },
        ];
      }

      setMessages((prev) => [...prev, ...botMessages]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Không thể kết nối server",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>🚗 Ford AI Assistant</div>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent:
                msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                ...styles.message,
                backgroundColor:
                  msg.sender === "user" ? "#2563eb" : "#e5e7eb",
                color: msg.sender === "user" ? "white" : "black",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ textAlign: "left", fontStyle: "italic" }}>
            Bot đang trả lời...
          </div>
        )}
      </div>

      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage} style={styles.button}>
          Gửi
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "350px",
    height: "500px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },

  header: {
    background: "#2563eb",
    color: "white",
    padding: "15px",
    fontWeight: "bold",
  },

  chatBox: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    background: "#f9fafb",
  },

  message: {
    padding: "10px 14px",
    borderRadius: "14px",
    maxWidth: "75%",
    whiteSpace: "pre-wrap",
  },

  inputArea: {
    display: "flex",
    borderTop: "1px solid #ddd",
  },

  input: {
    flex: 1,
    padding: "12px",
    border: "none",
    outline: "none",
  },

  button: {
    width: "70px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
};