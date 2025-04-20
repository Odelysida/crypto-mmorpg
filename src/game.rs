use std::collections::HashMap;

pub struct Position {
    pub x: f32,
    pub y: f32,
}

impl Clone for Position {
    fn clone(&self) -> Self {
        Position {
            x: self.x,
            y: self.y,
        }
    }
}

pub struct Player {
    pub id: String,
    pub position: Position,
    // ... other player fields
}

pub struct GameState {
    players: HashMap<String, Player>,
    world_width: f32,
    world_height: f32,
    collision_map: Vec<Vec<bool>>,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            players: HashMap::new(),
            world_width: 100.0,
            world_height: 100.0,
            collision_map: vec![vec![false; 100]; 100],
        }
    }

    pub fn move_player(&mut self, id: &str, dx: f32, dy: f32) -> bool {
        // First get the current position
        let current_pos = match self.players.get(id) {
            Some(player) => player.position.clone(),
            None => return false,
        };

        // Calculate new position
        let new_pos = Position {
            x: current_pos.x + dx,
            y: current_pos.y + dy,
        };

        // Validate position before modifying player
        if !self.is_position_valid(&new_pos) {
            return false;
        }

        // Now we can safely modify the player
        if let Some(player) = self.players.get_mut(id) {
            player.position = new_pos;
            true
        } else {
            false
        }
    }

    fn is_position_valid(&self, pos: &Position) -> bool {
        // Check world boundaries
        if pos.x < 0.0 || pos.x >= self.world_width || 
           pos.y < 0.0 || pos.y >= self.world_height {
            return false;
        }

        // Convert position to tile coordinates
        let tile_x = (pos.x / 32.0).floor() as usize;
        let tile_y = (pos.y / 32.0).floor() as usize;

        // Check collision map
        !self.collision_map[tile_y][tile_x]
    }

    pub fn add_player(&mut self, id: String, name: String) -> bool {
        if self.players.contains_key(&id) {
            return false;
        }

        let spawn_pos = self.get_random_spawn_position();
        let player = Player {
            id: id.clone(),
            position: spawn_pos,
            // Initialize other player fields
        };

        self.players.insert(id, player);
        true
    }

    fn get_random_spawn_position(&self) -> Position {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        
        loop {
            let pos = Position {
                x: rng.gen_range(1.0..self.world_width - 1.0),
                y: rng.gen_range(1.0..self.world_height - 1.0),
            };

            if self.is_position_valid(&pos) {
                return pos;
            }
        }
    }
} 