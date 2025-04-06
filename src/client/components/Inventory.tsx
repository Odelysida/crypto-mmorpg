import React from 'react';
import './Inventory.css';

interface InventoryProps {
  player: any;
}

const getRarityColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common': return '#ffffff';
    case 'uncommon': return '#1eff00';
    case 'rare': return '#0070dd';
    case 'epic': return '#a335ee';
    case 'legendary': return '#ff8000';
    default: return '#ffffff';
  }
};

const Inventory: React.FC<InventoryProps> = ({ player }) => {
  if (!player) {
    return (
      <div className="inventory">
        <h3>Inventory</h3>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="inventory">
      <h3>Inventory</h3>
      <div className="inventory-grid">
        {player.inventory.map((item: any) => (
          <div 
            key={item.id} 
            className="inventory-item"
            style={{ borderColor: getRarityColor(item.rarity) }}
          >
            <div className="item-header">
              <span className="item-name" style={{ color: getRarityColor(item.rarity) }}>
                {item.name}
              </span>
              <span className="item-type">{item.type}</span>
            </div>
            <div className="item-stats">
              {item.attributes.map((attr: any, index: number) => (
                <div key={index} className="item-attribute">
                  {attr.name}: +{attr.value}
                </div>
              ))}
            </div>
            <div className="item-footer">
              <span className="item-value">{item.value} gold</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory; 