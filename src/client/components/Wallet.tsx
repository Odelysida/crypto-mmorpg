import React, { useState } from 'react';
import { Player } from '../../shared/types';
import DraggableWindow from './DraggableWindow';
import './Wallet.css';

interface WalletProps {
  player: Player | null;
}

export default function Wallet({ player }: WalletProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!player || !player.walletAddress || !player.balance) {
    return null;
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <DraggableWindow 
      title="Wallet" 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)}
    >
      <div className="wallet">
        <div className="wallet-info">
          <div className="wallet-row">
            <span className="label">Address:</span>
            <span className="value">{formatAddress(player.walletAddress)}</span>
          </div>
          <div className="wallet-row">
            <span className="label">Balance:</span>
            <span className="value">{player.balance.toFixed(4)} CRYPTO</span>
          </div>
        </div>
        <div className="wallet-actions">
          <button className="action-button">
            <i className="fas fa-paper-plane"></i>
            Send
          </button>
          <button className="action-button">
            <i className="fas fa-qrcode"></i>
            Receive
          </button>
          <button className="action-button">
            <i className="fas fa-history"></i>
            History
          </button>
        </div>
      </div>
    </DraggableWindow>
  );
} 