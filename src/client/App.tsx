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
        return <div className="inventory-container">
          <Inventory player={player} />
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