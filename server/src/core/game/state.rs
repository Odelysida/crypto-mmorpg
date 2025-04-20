use std::collections::HashMap;
use uuid::Uuid;
use parking_lot::RwLock;
use std::sync::Arc;

use crate::domain::models::{
    player::{Player, Position},
    dungeon::{Dungeon, TileType},
};
use crate::domain::errors::GameError;
use crate::core::game::dungeon::DungeonGenerator;

pub struct GameState {
    players: HashMap<Uuid, Player>,
    dungeon: Dungeon,
    dungeon_generator: DungeonGenerator,
}

impl GameState {
    pub fn new() -> Self {
        let dungeon_generator = DungeonGenerator::new(4, 8, 10);
        let dungeon = dungeon_generator.generate(50, 50);
        
        Self {
            players: HashMap::new(),
            dungeon,
            dungeon_generator,
        }
    }

    pub fn add_player(&mut self, name: String, wallet_address: String) -> Player {
        let player = Player::new(name, wallet_address);
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
        let player = self.players.get_mut(&id)
            .ok_or(GameError::PlayerNotFound)?;
            
        if !self.is_position_valid(&new_pos) {
            return Err(GameError::InvalidPosition("Position out of bounds or in wall".to_string()));
        }
        
        player.update_position(new_pos);
        Ok(())
    }

    pub fn get_dungeon(&self) -> &Dungeon {
        &self.dungeon
    }

    pub fn regenerate_dungeon(&mut self) {
        self.dungeon = self.dungeon_generator.generate(50, 50);
        
        // Reset all players to valid positions
        for player in self.players.values_mut() {
            player.position = self.find_valid_spawn_position();
        }
    }

    fn is_position_valid(&self, pos: &Position) -> bool {
        let tile_x = (pos.x / 32.0) as i32;
        let tile_y = (pos.y / 32.0) as i32;
        
        self.dungeon.get_tile(tile_x, tile_y)
            .map(|tile| matches!(tile, TileType::Floor | TileType::Door))
            .unwrap_or(false)
    }

    fn find_valid_spawn_position(&self) -> Position {
        // Try to spawn in the center of the first room
        if let Some(first_room) = self.dungeon.rooms.first() {
            let (x, y) = first_room.center();
            return Position {
                x: x as f32 * 32.0 + 16.0,
                y: y as f32 * 32.0 + 16.0,
            };
        }

        // Fallback position
        Position { x: 64.0, y: 64.0 }
    }
}

pub type SharedGameState = Arc<RwLock<GameState>>; 