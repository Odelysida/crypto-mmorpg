import React from 'react';
import './PlayerStats.css';

interface PlayerStatsProps {
  player: any;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  if (!player) {
    return (
      <div className="player-stats">
        <h3>Player Stats</h3>
        <p>Loading player data...</p>
      </div>
    );
  }

  return (
    <div className="player-stats">
      <h3>Player Stats</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <label>Level:</label>
          <span>{player.level}</span>
        </div>
        <div className="stat-item">
          <label>Health:</label>
          <div className="progress-bar">
            <div 
              className="progress-fill health" 
              style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
            />
            <span>{player.health}/{player.maxHealth}</span>
          </div>
        </div>
        <div className="stat-item">
          <label>Mana:</label>
          <div className="progress-bar">
            <div 
              className="progress-fill mana" 
              style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
            />
            <span>{player.mana}/{player.maxMana}</span>
          </div>
        </div>
        <div className="stat-item">
          <label>Experience:</label>
          <div className="progress-bar">
            <div 
              className="progress-fill exp" 
              style={{ width: `${(player.exp / player.maxExp) * 100}%` }}
            />
            <span>{player.exp}/{player.maxExp}</span>
          </div>
        </div>
        <div className="stat-item">
          <label>Faction:</label>
          <span className={`faction ${player.faction}`}>{player.faction}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats; 