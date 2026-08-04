import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am the Pediacare assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const storedUser = localStorage.getItem("user");
      const userObj = storedUser ? JSON.parse(storedUser) : null;

      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/chat`, {
        message: userMessage,
        user: userObj
      });
      
      setMessages((prev) => [...prev, { role: 'ai', content: response.data.message }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to the server right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chatbot-toggle-btn shadow" onClick={toggleChat}>
          <i className="bi bi-chat-dots-fill"></i>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window shadow-lg">
          <div className="chatbot-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-white"><i className="bi bi-robot me-2"></i>Pediacare Assistant</h5>
            <button className="btn-close btn-close-white" onClick={toggleChat}></button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper ai">
                <div className="message-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="form-control"
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading || !input.trim()}>
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
