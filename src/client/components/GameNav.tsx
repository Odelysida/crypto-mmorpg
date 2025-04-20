import React from 'react';
import './GameNav.css';

interface GameNavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  player: any;
}

const GameNav: React.FC<GameNavProps> = ({ onNavigate, currentPage, player }) => {
  const navItems = [
    { id: 'quests', label: 'Quests', icon: '📜' },
    { id: 'inventory', label: 'Inventory', icon: '🎒' },
    { id: 'wallet', label: 'Wallet', icon: '💰' },
    { id: 'skills', label: 'Skills', icon: '⚔️' },
    { id: 'connection', label: 'Connection', icon: '🔗' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  // Calculate percentages (replace with actual player data when available)
  const expPercentage = player?.experience?.percentage || 0;
  const manaPercentage = player?.mana?.current / player?.mana?.max * 100 || 0;

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

      <div className="status-bars">
        <div className="status-bar">
          <div 
            className="bar-fill exp-bar" 
            style={{ width: `${expPercentage}%` }}
          />
          <span className="bar-label">EXP {expPercentage.toFixed(1)}%</span>
        </div>
        
        <div className="status-bar">
          <div 
            className="bar-fill mana-bar" 
            style={{ width: `${manaPercentage}%` }}
          />
          <span className="bar-label">
            MANA {player?.mana?.current || 0}/{player?.mana?.max || 100}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default GameNav; 