use std::collections::HashMap;
use uuid::Uuid;
use crate::types::*;
use crate::error::GameError;

pub struct GameState {
    players: HashMap<Uuid, Player>,
    dungeon: Dungeon,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            players: HashMap::new(),
            dungeon: Self::generate_dungeon(50, 50),
        }
    }

    pub fn add_player(&mut self, name: String, wallet_address: String) -> Player {
        let player = Player {
            id: Uuid::new_v4(),
            name,
            position: Position { x: 64.0, y: 64.0 }, // 2 tiles in
            health: 100,
            max_health: 100,
            mana: 100,
            max_mana: 100,
            exp: 0,
            max_exp: 1000,
            level: 1,
            faction: "neutral".to_string(),
            inventory: vec![],
            wallet_address,
            balance: 0.0,
        };
        
        self.players.insert(player.id, player.clone());
        player
    }

    pub fn get_player(&self, id: Uuid) -> Option<&Player> {
        self.players.get(&id)
    }

    pub fn get_players(&self) -> Vec<&Player> {
        self.players.values().collect()
    }

    pub fn update_player_position(&mut self, id: Uuid, new_pos: Position) -> Result<(), GameError> {
        // Check if the new position is valid first
        if !self.is_position_valid(&new_pos) {
            return Err(GameError::InvalidPosition("Position out of bounds".to_string()));
        }
        
        // Then get and update the player
        let player = self.players.get_mut(&id)
            .ok_or(GameError::PlayerNotFound)?;
            
        player.position = new_pos;
        Ok(())
    }

    pub fn get_dungeon(&self) -> &Dungeon {
        &self.dungeon
    }

    fn generate_dungeon(width: i32, height: i32) -> Dungeon {
        let mut tiles = vec![vec![TileType::Wall; width as usize]; height as usize];
        let mut rooms = Vec::new();
        
        // Generate rooms
        for _ in 0..10 {
            let room = Self::generate_room(width, height);
            Self::carve_room(&mut tiles, &room);
            rooms.push(room);
        }
        
        // Connect rooms with corridors
        for i in 0..rooms.len() - 1 {
            Self::create_corridor(&mut tiles, &rooms[i], &rooms[i + 1]);
        }
        
        Dungeon {
            width,
            height,
            tiles,
            rooms,
        }
    }

    fn generate_room(max_width: i32, max_height: i32) -> Room {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        
        let width = rng.gen_range(4..8);
        let height = rng.gen_range(4..8);
        let x = rng.gen_range(1..max_width - width - 1);
        let y = rng.gen_range(1..max_height - height - 1);
        
        Room {
            x,
            y,
            width,
            height,
        }
    }

    fn carve_room(tiles: &mut Vec<Vec<TileType>>, room: &Room) {
        for y in room.y..room.y + room.height {
            for x in room.x..room.x + room.width {
                if y >= 0 && y < tiles.len() as i32 && x >= 0 && x < tiles[0].len() as i32 {
                    tiles[y as usize][x as usize] = TileType::Floor;
                }
            }
        }
    }

    fn create_corridor(tiles: &mut Vec<Vec<TileType>>, room1: &Room, room2: &Room) {
        let (x1, y1) = (
            room1.x + room1.width / 2,
            room1.y + room1.height / 2
        );
        let (x2, y2) = (
            room2.x + room2.width / 2,
            room2.y + room2.height / 2
        );
        
        // Horizontal then vertical
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
    }

    fn is_position_valid(&self, pos: &Position) -> bool {
        let tile_x = (pos.x / 32.0) as usize;
        let tile_y = (pos.y / 32.0) as usize;
        
        if tile_x >= self.dungeon.width as usize || tile_y >= self.dungeon.height as usize {
            return false;
        }
        
        matches!(self.dungeon.tiles[tile_y][tile_x], TileType::Floor | TileType::Door)
    }
} 