export interface Stats {
  strength: number;
  dexterity: number;
  intelligence: number;
  damage?: number;
  armor?: number;
  healthBonus?: number;
  manaBonus?: number;
}

export interface Player {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  exp: number;
  maxExp: number;
  level: number;
  stats: Stats;
  inventory: {
    items: (Item | null)[];
    equipment: Equipment;
  };
  wallet: {
    address: string;
    balance: number;
  };
}

export enum ItemType {
  Weapon = 'Weapon',
  Armor = 'Armor',
  Consumable = 'Consumable',
  Resource = 'Resource',
  Quest = 'Quest',
  NFT = 'NFT'
}

export enum Rarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary'
}

export enum EquipmentSlot {
  MainHand = 'MainHand',
  OffHand = 'OffHand',
  Head = 'Head',
  Chest = 'Chest',
  Legs = 'Legs',
  Feet = 'Feet',
  Hands = 'Hands',
  Neck = 'Neck',
  Ring1 = 'Ring1',
  Ring2 = 'Ring2'
}

export interface Item {
  id: string;
  name: string;
  itemType: ItemType;
  rarity: Rarity;
  stats: Stats;
  stackable: boolean;
  stackSize: number;
  description: string;
  nftContract?: string;
  nftTokenId?: string;
  icon?: string;
}

export interface Equipment {
  [EquipmentSlot.MainHand]?: Item;
  [EquipmentSlot.OffHand]?: Item;
  [EquipmentSlot.Head]?: Item;
  [EquipmentSlot.Chest]?: Item;
  [EquipmentSlot.Legs]?: Item;
  [EquipmentSlot.Feet]?: Item;
  [EquipmentSlot.Hands]?: Item;
  [EquipmentSlot.Neck]?: Item;
  [EquipmentSlot.Ring1]?: Item;
  [EquipmentSlot.Ring2]?: Item;
} 