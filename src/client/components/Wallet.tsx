import React from 'react';
import './Wallet.css';

interface WalletProps {
  player: any;
}

const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Wallet: React.FC<WalletProps> = ({ player }) => {
  if (!player) {
    return (
      <div className="wallet">
        <h3>Crypto Wallet</h3>
        <p>Loading wallet...</p>
      </div>
    );
  }

  return (
    <div className="wallet">
      <h3>Crypto Wallet</h3>
      <div className="wallet-info">
        <div className="wallet-address">
          <label>Address:</label>
          <span>{formatAddress(player.wallet.address)}</span>
        </div>
        <div className="wallet-balance">
          <label>Balance:</label>
          <span>{player.wallet.balance.toFixed(4)} ETH</span>
        </div>
      </div>
      <div className="wallet-actions">
        <button className="action-button">
          <span className="icon">↑</span>
          Send
        </button>
        <button className="action-button">
          <span className="icon">↓</span>
          Receive
        </button>
        <button className="action-button">
          <span className="icon">≡</span>
          History
        </button>
      </div>
    </div>
  );
};

export default Wallet; 