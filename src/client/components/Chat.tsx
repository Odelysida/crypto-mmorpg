import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import './Chat.css';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'user' | 'system';
}

interface ChatProps {
  socket: Socket | null;
}

const Chat: React.FC<ChatProps> = ({ socket }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('chat:message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('chat:system', (message: ChatMessage) => {
      setMessages(prev => [...prev, { ...message, type: 'system' }]);
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:system');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !inputMessage.trim()) return;

    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      sender: 'Player',
      content: inputMessage.trim(),
      type: 'user'
    };

    socket.emit('chat:message', message);
    setInputMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.type}`}>
            <span className="message-time">[{formatTimestamp(message.timestamp)}]</span>
            <span className="message-sender">{message.sender}:</span>
            <span className="message-text">{message.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          maxLength={200}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat; 