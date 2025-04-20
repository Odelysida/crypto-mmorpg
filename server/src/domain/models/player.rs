use serde::{Serialize, Deserialize};
use uuid::Uuid;
use super::item::Item;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stats {
    pub health: i32,
    pub max_health: i32,
    pub mana: i32,
    pub max_mana: i32,
    pub exp: i32,
    pub max_exp: i32,
    pub level: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallet {
    pub address: String,
    pub balance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: Uuid,
    pub name: String,
    pub position: Position,
    pub stats: Stats,
    pub faction: String,
    pub inventory: Vec<Item>,
    pub wallet: Wallet,
}

impl Player {
    pub fn new(name: String, wallet_address: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            name,
            position: Position { x: 64.0, y: 64.0 },
            stats: Stats {
                health: 100,
                max_health: 100,
                mana: 100,
                max_mana: 100,
                exp: 0,
                max_exp: 1000,
                level: 1,
            },
            faction: "neutral".to_string(),
            inventory: Vec::new(),
            wallet: Wallet {
                address: wallet_address,
                balance: 0.0,
            },
        }
    }

    pub fn update_position(&mut self, new_pos: Position) {
        self.position = new_pos;
    }

    pub fn add_item(&mut self, item: Item) {
        self.inventory.push(item);
    }

    pub fn remove_item(&mut self, item_id: Uuid) -> Option<Item> {
        if let Some(pos) = self.inventory.iter().position(|item| item.id == item_id) {
            Some(self.inventory.remove(pos))
        } else {
            None
        }
    }
} 