import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import GameCanvas from './components/GameCanvas';
import GameNav from './components/GameNav';
import PlayerStats from './components/PlayerStats';
import Inventory from './components/Inventory';
import Wallet from './components/Wallet';
import Chat from './components/Chat';
import './App.css';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [player, setPlayer] = useState(null);
  const [currentPage, setCurrentPage] = useState('game');

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('gameState', (gameState) => {
      setPlayer(gameState.player);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page === currentPage ? 'game' : page);
  };

  const renderPage = () => {
    if (currentPage === 'game') return null;
    
    switch (currentPage) {
      case 'inventory':
        return <Inventory player={player} />;
      case 'wallet':
        return <Wallet player={player} />;
      case 'quests':
        return <div className="page-container">Quests Page (Coming Soon)</div>;
      case 'skills':
        return <div className="page-container">Skills Page (Coming Soon)</div>;
      case 'connection':
        return <div className="page-container">Connection Page (Coming Soon)</div>;
      case 'settings':
        return <div className="page-container">Settings Page (Coming Soon)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="game-main">
        <GameCanvas socket={socket} player={player} />
        <div className="game-overlay">
          <PlayerStats player={player} />
          <GameNav onNavigate={handleNavigate} currentPage={currentPage} />
          {renderPage()}
          <Chat socket={socket} />
        </div>
      </div>
    </div>
  );
};

export default App; 