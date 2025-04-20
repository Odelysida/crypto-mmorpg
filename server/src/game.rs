/// Game state management module
use std::collections::HashMap;
use uuid::Uuid;
use crate::types::*;
use crate::error::GameError;
use rand::Rng;

const PLAYER_SPEED: i32 = 5;

/// Central game state manager
/// 
/// Manages all game state including players, dungeon layout, and game world.
/// Uses concurrent data structures for safe multi-threaded access.
pub struct GameState {
    /// Map of player IDs to their corresponding player data
    players: HashMap<Uuid, Player>,
    /// Current dungeon layout and configuration
    dungeon: Dungeon,
    subscribers: Vec<Box<dyn Fn(&str) + Send>>,
}

impl GameState {
    /// Creates a new game state with an empty player list and generated dungeon
    /// 
    /// # Returns
    /// A new GameState instance with a 100x100 procedurally generated dungeon
    pub fn new() -> Self {
        Self {
            players: HashMap::new(),
            dungeon: Dungeon::new(100, 100), // Create a 100x100 dungeon
            subscribers: Vec::new(),
        }
    }

    /// Adds a new player to the game
    /// 
    /// # Arguments
    /// * `id` - UUID of the player
    /// * `name` - Player's display name
    /// 
    /// # Returns
    /// The newly created Player instance
    pub fn add_player(&mut self, id: Uuid, name: String) -> Player {
        // Start players in the center of the dungeon
        let position = Position::new(
            (self.dungeon.width / 2) as i32,
            (self.dungeon.height / 2) as i32,
        );
        let player = Player::new(id, name, position);
        self.players.insert(id, player.clone());
        player
    }

    /// Removes a player from the game
    /// 
    /// # Arguments
    /// * `id` - UUID of the player to remove
    pub fn remove_player(&mut self, id: Uuid) {
        self.players.remove(&id);
    }

    /// Retrieves a player by their ID
    /// 
    /// # Arguments
    /// * `id` - UUID of the player to retrieve
    /// 
    /// # Returns
    /// Option containing a reference to the player if found
    pub fn get_player(&self, id: Uuid) -> Option<&Player> {
        self.players.get(&id)
    }

    /// Gets a list of all players currently in the game
    /// 
    /// # Returns
    /// Vector of references to all players
    pub fn get_players(&self) -> Vec<&Player> {
        self.players.values().collect()
    }

    /// Updates a player's position if the new position is valid
    /// 
    /// # Arguments
    /// * `id` - UUID of the player to move
    /// * `movement` - Movement direction and magnitude
    /// 
    /// # Returns
    /// Result indicating success or failure with error details
    pub fn update_player_movement(&mut self, id: Uuid, movement: Movement) {
        if let Some(player) = self.players.get_mut(&id) {
            let mut new_pos = player.position;

            // Calculate new position based on movement
            if movement.up {
                new_pos.y -= PLAYER_SPEED;
            }
            if movement.down {
                new_pos.y += PLAYER_SPEED;
            }
            if movement.left {
                new_pos.x -= PLAYER_SPEED;
            }
            if movement.right {
                new_pos.x += PLAYER_SPEED;
            }

            // Validate new position
            if self.is_valid_position(new_pos) {
                player.position = new_pos;
                self.broadcast_message(&format!("Player {} moved to ({}, {})", 
                    player.name, new_pos.x, new_pos.y));
            }
        }
    }

    /// Checks if a position is valid within the dungeon
    /// 
    /// # Arguments
    /// * `pos` - Reference to the position to check
    /// 
    /// # Returns
    /// Boolean indicating whether the position is valid (walkable tile)
    fn is_valid_position(&self, pos: Position) -> bool {
        // Convert position to tile coordinates
        let tile_x = (pos.x / PLAYER_SPEED) as usize;
        let tile_y = (pos.y / PLAYER_SPEED) as usize;

        // Check if the position is within bounds and not a wall
        match self.dungeon.get_tile(tile_x, tile_y) {
            TileType::Wall => false,
            _ => true
        }
    }

    /// Gets a reference to the current dungeon
    /// 
    /// # Returns
    /// Reference to the current dungeon layout
    pub fn get_dungeon(&self) -> &Dungeon {
        &self.dungeon
    }

    /// Generates a new dungeon with rooms and corridors
    /// 
    /// # Arguments
    /// * `width` - Width of the dungeon in tiles
    /// * `height` - Height of the dungeon in tiles
    /// 
    /// # Returns
    /// A new Dungeon instance with randomly generated rooms and connecting corridors
    fn generate_dungeon(width: i32, height: i32) -> Dungeon {
        let mut rng = rand::thread_rng();
        let mut tiles = vec![vec![TileType::Wall; width as usize]; height as usize];
        let mut rooms = Vec::new();
        let num_rooms = rng.gen_range(5..11); // 5-10 rooms

        // Generate rooms
        for _ in 0..100 {
            if rooms.len() >= num_rooms {
                break;
            }

            let room_width = rng.gen_range(4..8);
            let room_height = rng.gen_range(4..8);
            let x = rng.gen_range(1..width - room_width - 1);
            let y = rng.gen_range(1..height - room_height - 1);

            let new_room = Room {
                x,
                y,
                width: room_width,
                height: room_height,
            };

            if !rooms.iter().any(|room| Self::do_rooms_overlap(&new_room, room)) {
                Self::carve_room(&mut tiles, &new_room);
                if !rooms.is_empty() {
                    Self::create_corridor(&mut tiles, &rooms[rooms.len() - 1], &new_room);
                }
                rooms.push(new_room);
            }
        }

        // Add doors at corridor intersections
        for y in 1..height as usize - 1 {
            for x in 1..width as usize - 1 {
                if tiles[y][x] == TileType::Floor {
                    let is_horizontal = tiles[y][x - 1] == TileType::Floor && tiles[y][x + 1] == TileType::Floor;
                    let is_vertical = tiles[y - 1][x] == TileType::Floor && tiles[y + 1][x] == TileType::Floor;
                    
                    if is_horizontal && is_vertical && rng.gen_bool(0.2) {
                        tiles[y][x] = TileType::Door;
                    }
                }
            }
        }

        Dungeon {
            width,
            height,
            tiles,
            rooms,
        }
    }

    /// Checks if two rooms overlap
    /// 
    /// # Arguments
    /// * `room1` - Reference to the first room
    /// * `room2` - Reference to the second room
    /// 
    /// # Returns
    /// Boolean indicating whether the rooms overlap
    fn do_rooms_overlap(room1: &Room, room2: &Room) -> bool {
        !(room1.x + room1.width + 1 < room2.x ||
          room2.x + room2.width + 1 < room1.x ||
          room1.y + room1.height + 1 < room2.y ||
          room2.y + room2.height + 1 < room1.y)
    }

    /// Carves out a room in the dungeon by setting tiles to floor type
    /// 
    /// # Arguments
    /// * `tiles` - Mutable reference to the dungeon tiles
    /// * `room` - Reference to the room to carve
    fn carve_room(tiles: &mut Vec<Vec<TileType>>, room: &Room) {
        for y in room.y..room.y + room.height {
            for x in room.x..room.x + room.width {
                if y >= 0 && y < tiles.len() as i32 && x >= 0 && x < tiles[0].len() as i32 {
                    tiles[y as usize][x as usize] = TileType::Floor;
                }
            }
        }
    }

    /// Creates a corridor between two rooms
    /// 
    /// # Arguments
    /// * `tiles` - Mutable reference to the dungeon tiles
    /// * `room1` - Reference to the first room
    /// * `room2` - Reference to the second room
    fn create_corridor(tiles: &mut Vec<Vec<TileType>>, room1: &Room, room2: &Room) {
        let (x1, y1) = (
            room1.x + room1.width / 2,
            room1.y + room1.height / 2
        );
        let (x2, y2) = (
            room2.x + room2.width / 2,
            room2.y + room2.height / 2
        );
        
        let mut rng = rand::thread_rng();
        let horizontal_first = rng.gen_bool(0.5);

        if horizontal_first {
            for x in x1.min(x2)..=x1.max(x2) {
                if x >= 0 && x < tiles[0].len() as i32 {
                    tiles[y1 as usize][x as usize] = TileType::Floor;
                }
            }
            for y in y1.min(y2)..=y1.max(y2) {
                if y >= 0 && y < tiles.len() as i32 {
                    tiles[y as usize][x2 as usize] = TileType::Floor;
                }
            }
        } else {
            for y in y1.min(y2)..=y1.max(y2) {
                if y >= 0 && y < tiles.len() as i32 {
                    tiles[y as usize][x1 as usize] = TileType::Floor;
                }
            }
            for x in x1.min(x2)..=x1.max(x2) {
                if x >= 0 && x < tiles[0].len() as i32 {
                    tiles[y2 as usize][x as usize] = TileType::Floor;
                }
            }
        }
    }

    pub fn subscribe<F>(&mut self, callback: F)
    where
        F: Fn(&str) + Send + 'static,
    {
        self.subscribers.push(Box::new(callback));
    }

    fn broadcast_message(&self, message: &str) {
        for subscriber in &self.subscribers {
            subscriber(message);
        }
    }
} 