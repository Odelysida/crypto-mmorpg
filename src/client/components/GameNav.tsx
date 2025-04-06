import React from 'react';
import './GameNav.css';

interface GameNavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const GameNav: React.FC<GameNavProps> = ({ onNavigate, currentPage }) => {
  const navItems = [
    { id: 'quests', label: 'Quests', icon: '📜' },
    { id: 'inventory', label: 'Inventory', icon: '🎒' },
    { id: 'wallet', label: 'Wallet', icon: '💰' },
    { id: 'skills', label: 'Skills', icon: '⚔️' },
    { id: 'connection', label: 'Connection', icon: '🔗' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="game-nav">
      <div className="nav-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default GameNav; 