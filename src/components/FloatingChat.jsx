
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";

import { sendChatMessage } from "../services/api";

import "./FloatingChat.css";

const suggestedQuestions = [
  "How do I analyze a tender document?",
  "What documents are required for a tender?",
  "How can I understand eligibility requirements?",
  "What is tender evidence verification?",
  "How can I view my previous analysis?",
];

function FloatingChat() {
  const location = useLocation();

  const tenderId = location.state?.tenderId || null;
  const demo = location.state?.demo === true;

  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

 useEffect(() => {
  const popupInterval = setInterval(() => {
    if (!isOpen) {
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
  }, 15000);

  return () => clearInterval(popupInterval);
}, [isOpen]);

  const openChat = () => {
    setIsOpen(true);
    setShowPopup(false);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  // Send message to Gemini AI
  const sendMessage = async (text) => {
    const userMessage = text.trim();

    if (!userMessage || loading) {
      return;
    }

    if (demo) {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "user",
          text: userMessage,
        },
        {
          sender: "bot",
          text: "Chat is unavailable in Preview Mode. Please open an actual uploaded tender to use TenderLens AI.",
        },
      ]);

      setMessage("");
      return;
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await sendChatMessage(
        userMessage,
        tenderId
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text:
            response.response ||
            "Sorry, I could not generate a response.",
        },
      ]);

    } catch (error) {
      console.error("TenderLens Chat Error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text:
            error.message ||
            "Unable to connect to TenderLens AI. Please try again.",
        },
      ]);

    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(message);
  };

  return (
    <>
      {/* Popup */}

      {showPopup && !isOpen && (
        <div className="chat-popup">
          <span>✦</span>

          <div>
            <strong>Need help? 👋</strong>
            <p>Ask TenderLens AI about your tenders.</p>
          </div>

          <button
            type="button"
            className="popup-close"
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Chat Button */}

      <button
  type="button"
  className={`floating-chat-button ${showPopup && !isOpen ? "chat-pulse" : ""}`}
  onClick={() => {
    setIsOpen((previous) => !previous);
    setShowPopup(false);
  }}
  aria-label={isOpen ? "Close TenderLens AI" : "Open TenderLens AI"}
  title="Chat with TenderLens AI"
>
  {isOpen ? "×" : "✦"}
</button>

      {/* Chat Window */}

      {isOpen && (
        <div className="floating-chat-window">

          <div className="chat-header">

            <div className="chat-header-info">
              <div className="chat-avatar">✦</div>

              <div>
                <h3>TenderLens AI</h3>
                <span>● Your Tender Assistant</span>
              </div>
            </div>

            <button
              type="button"
              className="chat-close"
              onClick={closeChat}
              aria-label="Close chat"
            >
              ×
            </button>

          </div>

          <div className="chat-body">

            <div className="chat-welcome">
              <div className="welcome-icon">✦</div>

              <h3>Hello! Welcome to TenderLens AI 👋</h3>

              <p>
                Your assistant for understanding tender
                documents and using TenderLens BD.
              </p>
            </div>

            {messages.length === 0 && (
              <div className="suggested-questions">

                <h4>SUGGESTED QUESTIONS</h4>

                {suggestedQuestions.map((question, index) => (
                  <button
                    type="button"
                    key={index}
                    disabled={loading}
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                    <span>↗</span>
                  </button>
                ))}

              </div>
            )}

            <div className="chat-messages">

              {messages.map((item, index) => (
                    <div className={`chat-message ${item.sender}`}>
                            {item.sender === "bot" ? (
                            <ReactMarkdown>{item.text}</ReactMarkdown>
                                ) : (
                                item.text
                             )}
                    </div>
              ))}

              {loading && (
                <div className="chat-message bot">
                  TenderLens AI is thinking...
                </div>
              )}

            </div>

          </div>

          <form
            className="chat-input-area"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about your tender..."
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!message.trim() || loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          <p className="chat-footer">
            TenderLens AI · Tender-focused assistance
          </p>

        </div>
      )}
    </>
  );
}

export default FloatingChat;
