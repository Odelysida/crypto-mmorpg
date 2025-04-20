import React, { useState, useCallback } from 'react';
import DraggableWindow from './DraggableWindow';
import { Player, Item, EquipmentSlot } from '../../shared/types';
import { inventoryService } from '../services/inventoryService';
import './Inventory.css';

interface InventoryProps {
  player: Player | null;
  onInventoryUpdate?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const getRarityColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common': return '#9d9d9d';
    case 'uncommon': return '#1eff00';
    case 'rare': return '#0070dd';
    case 'epic': return '#a335ee';
    case 'legendary': return '#ff8000';
    default: return '#ffffff';
  }
};

const Inventory: React.FC<InventoryProps> = ({
  player,
  onInventoryUpdate,
  isOpen,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = useCallback((error: string) => {
    setErrorMessage(error);
    setTimeout(() => setErrorMessage(null), 3000);
  }, []);

  if (!player) {
    return null;
  }

  const handleItemClick = (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    setSelectedItem(item);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleEquipItem = async (item: Item, slot: EquipmentSlot) => {
    if (!player) return;
    
    const result = await inventoryService.equipItem(player.id, item.id, slot);
    if (result.success) {
      onInventoryUpdate?.();
    } else {
      handleError(result.message || 'Failed to equip item');
    }
    setSelectedItem(null);
    setContextMenuPos(null);
  };

  const handleUnequipItem = async (slot: EquipmentSlot) => {
    if (!player) return;
    
    const result = await inventoryService.unequipItem(player.id, slot);
    if (result.success) {
      onInventoryUpdate?.();
    } else {
      handleError(result.message || 'Failed to unequip item');
    }
  };

  const handleUseItem = async (item: Item) => {
    if (!player) return;
    
    const result = await inventoryService.useItem(player.id, item.id);
    if (result.success) {
      onInventoryUpdate?.();
    } else {
      handleError(result.message || 'Failed to use item');
    }
    setSelectedItem(null);
    setContextMenuPos(null);
  };

  const handleDropItem = async (item: Item) => {
    if (!player) return;
    
    const result = await inventoryService.dropItem(player.id, item.id);
    if (result.success) {
      onInventoryUpdate?.();
    } else {
      handleError(result.message || 'Failed to drop item');
    }
    setSelectedItem(null);
    setContextMenuPos(null);
  };

  const closeContextMenu = () => {
    setSelectedItem(null);
    setContextMenuPos(null);
  };

  return (
    <DraggableWindow 
      title="Inventory" 
      onClose={onClose || closeContextMenu}
      isOpen={isOpen ?? true}
    >
      <div className="inventory-container">
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        
        <div className="equipment-slots">
          {Object.entries(player.inventory.equipment).map(([slot, item]) => (
            <div
              key={slot}
              className={`equipment-slot ${slot.toLowerCase()}`}
              onClick={() => item && handleUnequipItem(slot as EquipmentSlot)}
            >
              {item && (
                <div className="item" style={{ borderColor: getRarityColor(item.rarity) }}>
                  {item.icon ? (
                    <img src={item.icon} alt={item.name} />
                  ) : (
                    <div className="item-placeholder">{item.name[0]}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="inventory-grid">
          {player.inventory.items.map((item, index) => (
            <div
              key={index}
              className="inventory-slot"
              onContextMenu={(e) => item && handleItemClick(e, item)}
            >
              {item && (
                <div className="item" style={{ borderColor: getRarityColor(item.rarity) }}>
                  {item.icon ? (
                    <img src={item.icon} alt={item.name} />
                  ) : (
                    <div className="item-placeholder">{item.name[0]}</div>
                  )}
                  {item.stackable && item.stackSize > 1 && (
                    <span className="stack-size">{item.stackSize}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {contextMenuPos && selectedItem && (
          <div
            className="context-menu"
            style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          >
            {selectedItem.itemType === 'Consumable' && (
              <button onClick={() => handleUseItem(selectedItem)}>Use</button>
            )}
            {(selectedItem.itemType === 'Weapon' || selectedItem.itemType === 'Armor') && (
              <button onClick={() => handleEquipItem(selectedItem, 
                selectedItem.itemType === 'Weapon' ? EquipmentSlot.MainHand : EquipmentSlot.Chest
              )}>Equip</button>
            )}
            <button onClick={() => handleDropItem(selectedItem)}>Drop</button>
          </div>
        )}
      </div>
    </DraggableWindow>
  );
};

export default Inventory; 