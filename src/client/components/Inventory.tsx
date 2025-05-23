import React, { useState, useCallback } from 'react';
import DraggableWindow from './DraggableWindow';
import { Player, Item, EquipmentSlot, Rarity, ItemType } from '../../shared/types';
import { Socket } from 'socket.io-client';
import './Inventory.css';

interface InventoryProps {
  player: Player | null;
  socket: Socket | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const getRarityColor = (rarity: Rarity): string => {
  switch (rarity) {
    case Rarity.Common: return '#9d9d9d';
    case Rarity.Uncommon: return '#1eff00';
    case Rarity.Rare: return '#0070dd';
    case Rarity.Epic: return '#a335ee';
    case Rarity.Legendary: return '#ff8000';
    default: return '#ffffff';
  }
};

const Inventory: React.FC<InventoryProps> = ({
  player,
  socket,
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

  if (!player || !socket) {
    return null;
  }

  const handleItemClick = (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    setSelectedItem(item);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleEquipItem = (item: Item, slot: EquipmentSlot) => {
    socket.emit('equipItem', { itemId: item.id, slot }, (response: { success: boolean, message?: string }) => {
      if (!response.success) {
        handleError(response.message || 'Failed to equip item');
      }
    });
    setSelectedItem(null);
    setContextMenuPos(null);
  };

  const handleUnequipItem = (slot: EquipmentSlot) => {
    socket.emit('unequipItem', { slot }, (response: { success: boolean, message?: string }) => {
      if (!response.success) {
        handleError(response.message || 'Failed to unequip item');
      }
    });
  };

  const handleUseItem = (item: Item) => {
    socket.emit('useItem', { itemId: item.id }, (response: { success: boolean, message?: string }) => {
      if (!response.success) {
        handleError(response.message || 'Failed to use item');
      }
    });
    setSelectedItem(null);
    setContextMenuPos(null);
  };

  const handleDropItem = (item: Item) => {
    socket.emit('dropItem', { itemId: item.id }, (response: { success: boolean, message?: string }) => {
      if (!response.success) {
        handleError(response.message || 'Failed to drop item');
      }
    });
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
            {selectedItem.itemType === ItemType.Consumable && (
              <button onClick={() => handleUseItem(selectedItem)}>Use</button>
            )}
            {(selectedItem.itemType === ItemType.Weapon || selectedItem.itemType === ItemType.Armor) && (
              <button onClick={() => handleEquipItem(selectedItem, 
                selectedItem.itemType === ItemType.Weapon ? EquipmentSlot.MainHand : EquipmentSlot.Chest
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