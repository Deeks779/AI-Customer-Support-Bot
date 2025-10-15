import React, { useEffect, useState } from "react";
import { startSession, sendMessage } from "../api";
import { FaPaperPlane } from "react-icons/fa";

// Define general styles outside the component for clean inline usage
const styles = {
  // Styles for the main chat container
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8f8f8', // Very light grey background
    fontFamily: 'Arial, sans-serif'
  },
  // Styles for the chat box (white card)
  chatBox: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '15px',
    padding: '20px',
    border: '1px solid #ddd'
  },
  // Styles for the message display area
  messageArea: {
    height: '450px',
    overflowY: 'auto',
    border: '1px solid #eee',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column'
  },
  // Base style for all messages
  messageBase: {
    maxWidth: '80%',
    padding: '10px 15px',
    borderRadius: '18px',
    margin: '8px 0',
    wordWrap: 'break-word',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.05)'
  },
  // Styles for user messages
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff', // Blue
    color: 'white',
    borderBottomRightRadius: '2px'
  },
  // Styles for bot messages
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6e6e6', // Light gray
    color: '#333',
    borderBottomLeftRadius: '2px'
  },
  // Styles for the input area
  inputArea: {
    display: 'flex',
    alignItems: 'center',
  },
  inputField: {
    flex: 1,
    border: '1px solid #ccc',
    padding: '12px 15px',
    borderRadius: '25px 0 0 25px',
    fontSize: '16px',
    boxShadow: 'none',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  sendButton: {
    backgroundColor: '#28a745', // Green for action
    color: 'white',
    padding: '12px 15px',
    border: 'none',
    borderRadius: '0 25px 25px 0',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

const ChatWindow = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Auto-scroll effect after message update
  useEffect(() => {
    const messageArea = document.getElementById('message-area');
    if (messageArea) {
      messageArea.scrollTop = messageArea.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const initSession = async () => {
      // NOTE: Using a simple try/catch for cleaner error display
      try {
        const res = await startSession();
        setSessionId(res.data.session_id || res.data.sessionId);
        setMessages([{ sender: "bot", text: "Hello! How may I assist you today?" }]);
      } catch (error) {
        setMessages([{ sender: "bot", text: "Error starting session. Please refresh." }]);
        console.error("Session start error:", error);
      }
    };
    initSession();
  }, []);

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText) return;
    
    // Optimistic UI update
    const userMsg = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput(""); // Clear input immediately
    
    try {
        const res = await sendMessage(sessionId, messageText);
        const botReply = res.data.reply || "I encountered an error trying to generate a response.";
        const botMsg = { sender: "bot", text: botReply };
        setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
        const errorMsg = { sender: "bot", text: "Sorry, I lost connection to the server or LLM." };
        setMessages((prev) => [...prev, errorMsg]);
        console.error("Message send error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '15px', color: '#333' }}>
          AI Support Bot 🤖
        </h2>
        
        {/* Message Display Area */}
        <div id="message-area" style={styles.messageArea}>
          {messages.map((msg, i) => (
            <div
              key={i}
              // Conditional styling based on sender
              style={{
                ...styles.messageBase,
                ...(msg.sender === "user" ? styles.userMessage : styles.botMessage),
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>
        
        {/* Input and Send Area */}
        <div style={styles.inputArea}>
          <input
            style={styles.inputField}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!sessionId} // Disable input if session hasn't started
          />
          <button
            style={styles.sendButton}
            onClick={handleSend}
            disabled={!sessionId || !input.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;