import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Chatbot() {

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [sessionId] = useState(() => {

  let id = localStorage.getItem("chat_session");

  if (!id) {

    id =
      "session_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 8);

    localStorage.setItem(
      "chat_session",
      id
    );
  }

  return id;
});

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào 👋 Tôi là Ford AI Assistant",
    },
  ]);

  const chatEndRef = useRef(null);

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async () => {

    if (!message.trim() || loading) return;

    const userText = message;

    // user message
    const userMessage = {
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    

    try {
  const res = await axios.post(
    "https://ford-admin.onrender.com/api/ai/chat",
    {
      message: userText,
      sessionId
    }
  );

  console.log("API RESPONSE:", res.data);
  let reply = res.data?.text || res.data?.reply || res.data?.message;
  // ==========================

  // =========================
  // FIX OBJECT RESPONSE
  // =========================
  if (typeof reply === "object" && reply !== null) {
    if (reply.text) {          // Thêm check cho thuộc tính text trong object
      reply = reply.text;
    } else if (reply.message) {
      reply = reply.message;
    } else {
      reply = JSON.stringify(reply, null, 2);
    }
  }

  // ... (Giữ nguyên các đoạn logic xử lý Array và setMessages phía dưới)

      // =========================
      // ARRAY RESPONSE
      // =========================

      let botMessages = [];

      if (Array.isArray(reply)) {

        botMessages = reply.map((r) => ({

          sender: "bot",

          text:
            typeof r === "object"
              ? JSON.stringify(r)
              : String(r),

        }));

      } else {

        botMessages = [
          {
            sender: "bot",

            text:
              reply
                ? String(reply)
                : "Không có phản hồi",
          },
        ];
      }

      setMessages((prev) => [
        ...prev,
        ...botMessages,
      ]);

    } catch (error) {

      console.error(
        "CHAT ERROR:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "❌ Không thể kết nối server",
        },
      ]);

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>
        🚗 Ford AI Assistant
      </div>

      {/* CHAT */}

      <div style={styles.chatBox}>

        {messages.map((msg, index) => (

          <div
            key={index}
            style={{
              display: "flex",

              justifyContent:
                msg.sender === "user"
                  ? "flex-end"
                  : "flex-start",

              marginBottom: 10,
            }}
          >

            <div
              style={{
                ...styles.message,

                backgroundColor:
                  msg.sender === "user"
                    ? "#2563eb"
                    : "#e5e7eb",

                color:
                  msg.sender === "user"
                    ? "white"
                    : "black",
              }}
            >

              {
                typeof msg.text === "object"
                  ? JSON.stringify(msg.text)
                  : String(msg.text)
              }

            </div>

          </div>
        ))}

        {/* LOADING */}

        {loading && (

          <div style={styles.typing}>
            🤖 Bot đang trả lời...
          </div>

        )}

        <div ref={chatEndRef} />

      </div>

      {/* INPUT */}

      <div style={styles.inputArea}>

        <input
          type="text"

          placeholder="Nhập tin nhắn..."

          value={message}

          onChange={(e) =>
            setMessage(e.target.value)
          }

          onKeyDown={(e) =>
            e.key === "Enter" &&
            sendMessage()
          }

          style={styles.input}

          disabled={loading}
        />

        <button
          onClick={sendMessage}

          style={{
            ...styles.button,

            opacity:
              loading ? 0.6 : 1,

            cursor:
              loading
                ? "not-allowed"
                : "pointer",
          }}

          disabled={loading}
        >
          Gửi
        </button>

      </div>

    </div>
  );
}

// =========================
// STYLES
// =========================

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

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.1)",
  },

  header: {

    background: "#2563eb",

    color: "white",

    padding: "15px",

    fontWeight: "bold",

    fontSize: "16px",
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

    wordBreak: "break-word",

    fontSize: "14px",

    lineHeight: "1.5",
  },

  typing: {

    textAlign: "left",

    fontStyle: "italic",

    color: "#666",

    paddingLeft: 10,

    marginTop: 5,
  },

  inputArea: {

    display: "flex",

    borderTop: "1px solid #ddd",

    background: "#fff",
  },

  input: {

    flex: 1,

    padding: "12px",

    border: "none",

    outline: "none",

    fontSize: "14px",
  },

  button: {

    width: "70px",

    border: "none",

    background: "#2563eb",

    color: "white",

    fontWeight: "bold",

    transition: "0.2s",
  },
};