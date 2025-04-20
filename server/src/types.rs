use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: Uuid,
    pub name: String,
    pub position: Position,
    pub health: i32,
    pub max_health: i32,
    pub mana: i32,
    pub max_mana: i32,
    pub exp: i32,
    pub max_exp: i32,
    pub level: i32,
    pub faction: String,
    pub inventory: Vec<Item>,
    pub wallet_address: String,
    pub balance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub id: Uuid,
    pub name: String,
    pub item_type: String,
    pub rarity: ItemRarity,
    pub value: i32,
    pub attributes: Vec<ItemAttribute>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemAttribute {
    pub name: String,
    pub value: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ItemRarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum TileType {
    Floor = 0,
    Wall = 1,
    Door = 2,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dungeon {
    pub width: i32,
    pub height: i32,
    pub tiles: Vec<Vec<TileType>>,
    pub rooms: Vec<Room>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveRequest {
    pub x: f32,
    pub y: f32,
} 