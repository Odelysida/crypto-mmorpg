/// Core type definitions for the game
use serde::{Serialize, Deserialize};
use uuid::Uuid;

/// Represents a 2D position in the game world
/// 
/// Uses floating-point coordinates for smooth movement
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Position {
    /// X coordinate in world space
    pub x: i32,
    /// Y coordinate in world space
    pub y: i32,
}

impl Position {
    pub fn new(x: i32, y: i32) -> Self {
        Self { x, y }
    }
}

/// Represents a player character in the game
/// 
/// Contains all player-specific data including stats, inventory, and wallet information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    /// Unique identifier for the player
    pub id: Uuid,
    /// Player's display name
    pub name: String,
    /// Current position in the game world
    pub position: Position,
    /// Current health points
    pub health: i32,
    /// Maximum health points
    pub max_health: i32,
    /// Current mana points
    pub mana: i32,
    /// Maximum mana points
    pub max_mana: i32,
    /// Current experience points
    pub exp: i32,
    /// Experience points needed for next level
    pub max_exp: i32,
    /// Current player level
    pub level: i32,
    /// Player's faction alignment
    pub faction: String,
    /// Player's inventory items
    pub inventory: Vec<Item>,
    /// Cryptocurrency wallet address
    pub wallet_address: String,
    /// Current cryptocurrency balance
    pub balance: f64,
}

impl Player {
    pub fn new(id: Uuid, name: String, position: Position) -> Self {
        Self {
            id,
            name,
            position,
            health: 0,
            max_health: 0,
            mana: 0,
            max_mana: 0,
            exp: 0,
            max_exp: 0,
            level: 0,
            faction: String::new(),
            inventory: Vec::new(),
            wallet_address: String::new(),
            balance: 0.0,
        }
    }
}

/// Represents an item in the game
/// 
/// Items can be equipment, consumables, or other collectibles
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    /// Unique identifier for the item
    pub id: Uuid,
    /// Item's display name
    pub name: String,
    /// Type of item (e.g., "weapon", "armor", "potion")
    pub item_type: ItemType,
    /// Item's rarity level
    pub rarity: Rarity,
    /// Base value in game currency
    pub value: i32,
    /// List of special attributes
    pub attributes: Vec<ItemAttribute>,
    /// Additional stats for the item
    pub stats: Stats,
}

/// Represents a special attribute of an item
/// 
/// Examples include damage bonus, armor rating, or magical effects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemAttribute {
    /// Name of the attribute
    pub name: String,
    /// Numerical value of the attribute
    pub value: i32,
}

/// Represents the rarity levels of items
/// 
/// Higher rarity items are generally more powerful and valuable
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Rarity {
    /// Basic items, commonly found
    Common,
    /// Slightly better than common
    Uncommon,
    /// Valuable and powerful items
    Rare,
    /// Very powerful items
    Epic,
    /// The most powerful and unique items
    Legendary,
}

/// Represents different types of tiles in the dungeon
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum TileType {
    /// Walkable floor tile
    Floor = 0,
    /// Solid wall tile that blocks movement
    Wall = 1,
    /// Door tile that can be opened/closed
    Door = 2,
}

/// Represents a room in the dungeon
/// 
/// Rooms are rectangular areas connected by corridors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
    /// X coordinate of the top-left corner
    pub x: i32,
    /// Y coordinate of the top-left corner
    pub y: i32,
    /// Width of the room in tiles
    pub width: i32,
    /// Height of the room in tiles
    pub height: i32,
}

/// Represents the complete dungeon layout
/// 
/// Contains the tile map and room information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dungeon {
    /// Width of the dungeon in tiles
    pub width: usize,
    /// Height of the dungeon in tiles
    pub height: usize,
    /// 2D grid of tile types
    pub tiles: Vec<TileType>,
    /// List of rooms in the dungeon
    pub rooms: Vec<Room>,
}

impl Dungeon {
    pub fn new(width: usize, height: usize) -> Self {
        let mut tiles = vec![TileType::Wall; width * height];
        
        // Create a simple room in the center
        let room_x = width / 4;
        let room_y = height / 4;
        let room_w = width / 2;
        let room_h = height / 2;

        for y in room_y..(room_y + room_h) {
            for x in room_x..(room_x + room_w) {
                tiles[y * width + x] = TileType::Floor;
            }
        }

        // Add some doors
        tiles[room_y * width + (room_x + room_w/2)] = TileType::Door;
        tiles[(room_y + room_h) * width + (room_x + room_w/2)] = TileType::Door;
        tiles[(room_y + room_h/2) * width + room_x] = TileType::Door;
        tiles[(room_y + room_h/2) * width + (room_x + room_w)] = TileType::Door;

        Self {
            width,
            height,
            tiles,
            rooms: Vec::new(),
        }
    }

    pub fn get_tile(&self, x: usize, y: usize) -> TileType {
        if x >= self.width || y >= self.height {
            TileType::Wall
        } else {
            self.tiles[y * self.width + x]
        }
    }
}

/// Request structure for player movement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveRequest {
    /// Target X coordinate
    pub x: f32,
    /// Target Y coordinate
    pub y: f32,
}

/// Additional stats for an item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stats {
    /// Damage bonus provided by the item
    pub damage: i32,
    /// Defense bonus provided by the item
    pub defense: i32,
    /// Magic bonus provided by the item
    pub magic: i32,
}

/// Type of item
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ItemType {
    /// Weapon item
    Weapon,
    /// Armor item
    Armor,
    /// Consumable item
    Consumable,
    /// Quest item
    Quest,
}

/// Additional movement structure
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct Movement {
    /// Indicates whether the player is moving up
    pub up: bool,
    /// Indicates whether the player is moving down
    pub down: bool,
    /// Indicates whether the player is moving left
    pub left: bool,
    /// Indicates whether the player is moving right
    pub right: bool,
} 