use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ItemType {
    Weapon,
    Armor,
    Consumable,
    Resource,
    Quest,
    NFT,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemStats {
    pub damage: Option<i32>,
    pub armor: Option<i32>,
    pub health_bonus: Option<i32>,
    pub mana_bonus: Option<i32>,
    pub strength_bonus: Option<i32>,
    pub dexterity_bonus: Option<i32>,
    pub intelligence_bonus: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub id: Uuid,
    pub name: String,
    pub item_type: ItemType,
    pub rarity: Rarity,
    pub stats: ItemStats,
    pub stackable: bool,
    pub stack_size: u32,
    pub description: String,
    pub nft_contract: Option<String>,
    pub nft_token_id: Option<String>,
}

impl Item {
    pub fn new(
        name: String,
        item_type: ItemType,
        rarity: Rarity,
        stats: ItemStats,
        stackable: bool,
        description: String,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            item_type,
            rarity,
            stats,
            stackable,
            stack_size: 1,
            description,
            nft_contract: None,
            nft_token_id: None,
        }
    }

    pub fn new_nft(
        name: String,
        rarity: Rarity,
        stats: ItemStats,
        description: String,
        contract: String,
        token_id: String,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            item_type: ItemType::NFT,
            rarity,
            stats,
            stackable: false,
            stack_size: 1,
            description,
            nft_contract: Some(contract),
            nft_token_id: Some(token_id),
        }
    }

    pub fn is_equippable(&self) -> bool {
        matches!(self.item_type, ItemType::Weapon | ItemType::Armor)
    }

    pub fn is_consumable(&self) -> bool {
        self.item_type == ItemType::Consumable
    }

    pub fn is_nft(&self) -> bool {
        self.item_type == ItemType::NFT
    }

    pub fn add_to_stack(&mut self, amount: u32) -> bool {
        if !self.stackable {
            return false;
        }
        self.stack_size += amount;
        true
    }

    pub fn remove_from_stack(&mut self, amount: u32) -> bool {
        if !self.stackable || amount > self.stack_size {
            return false;
        }
        self.stack_size -= amount;
        true
    }
} 