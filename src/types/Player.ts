export interface Player {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  health: number;
  mana: number;
  level: number;
  faction: string;
  inventory: InventoryItem[];
  skills: Skill[];
  wallet: {
    address: string;
    balance: number;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'material' | 'quest';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  attributes?: {
    [key: string]: number;
  };
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  experience: number;
  type: 'combat' | 'crafting' | 'magic' | 'social';
} 