import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'user' | 'system';
}

interface ChatProps {
  socket: WebSocket | null;
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

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'ChatMessage') {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: message.data.sender,
            content: message.data.message,
            timestamp: Date.now(),
            type: 'user'
          }]);
        } else if (message.type === 'SystemMessage') {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: 'System',
            content: message.data.message,
            timestamp: Date.now(),
            type: 'system'
          }]);
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
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

    socket.send(JSON.stringify({
      type: 'Chat',
      data: {
        message: inputMessage.trim()
      }
    }));
    setInputMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.type}`}>
            <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
            <span className="message-sender">{msg.sender}:</span>
            <span className="message-text">{msg.content}</span>
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
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat; 