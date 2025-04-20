import React, { useEffect, useState, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import GameNav from './components/GameNav';
import PlayerStats from './components/PlayerStats';
import Inventory from './components/Inventory';
import Wallet from './components/Wallet';
import Chat from './components/Chat';
import './App.css';

interface WebSocketMessage {
  type: string;
  data: any;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [player, setPlayer] = useState(null);
  const [currentPage, setCurrentPage] = useState('game');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('Connected to server');
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        switch (message.type) {
          case 'Welcome':
            setPlayer(message.data.player);
            break;
          case 'PlayerMoved':
            // Handle player movement
            break;
          case 'ChatMessage':
            // Handle chat messages
            break;
          case 'Error':
            console.error('Server error:', message.data.message);
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page === currentPage ? 'game' : page);
  };

  const renderPage = () => {
    if (currentPage === 'game') return null;
    
    switch (currentPage) {
      case 'inventory':
        return <div className="inventory-container">
          <Inventory player={player} socket={socket} />
        </div>;
      case 'wallet':
        return <Wallet player={player} />;
      case 'quests':
        return <div className="page-container">
          <h2>Quests</h2>
          <p>Available quests will appear here...</p>
        </div>;
      case 'skills':
        return <div className="page-container">
          <h2>Skills</h2>
          <p>Your character skills and abilities...</p>
        </div>;
      case 'connection':
        return <div className="page-container">
          <h2>Wallet Connection</h2>
          <p>Connect your crypto wallet...</p>
        </div>;
      case 'settings':
        return <div className="page-container">
          <h2>Settings</h2>
          <p>Game settings and options...</p>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="game-main">
        <div className="game-sidebar-left">
          <PlayerStats player={player} />
        </div>

        <div className="game-canvas-container">
          <GameCanvas socket={socket} player={player} />
        </div>

        <div className="game-sidebar-right">
          <Chat socket={socket} />
        </div>

        <GameNav 
          onNavigate={handleNavigate} 
          currentPage={currentPage} 
          player={player}
        />
        {renderPage()}
      </div>
    </div>
  );
};

export default App; 