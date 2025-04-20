use rand::Rng;
use crate::domain::models::dungeon::{Dungeon, Room, TileType};

pub struct DungeonGenerator {
    min_room_size: i32,
    max_room_size: i32,
    max_rooms: i32,
}

impl DungeonGenerator {
    pub fn new(min_room_size: i32, max_room_size: i32, max_rooms: i32) -> Self {
        Self {
            min_room_size,
            max_room_size,
            max_rooms,
        }
    }

    pub fn generate(&self, width: i32, height: i32) -> Dungeon {
        let mut dungeon = Dungeon::new(width, height);
        let mut rng = rand::thread_rng();
        let mut attempts = 0;
        let max_attempts = self.max_rooms * 3;

        while dungeon.rooms.len() < self.max_rooms as usize && attempts < max_attempts {
            let room_width = rng.gen_range(self.min_room_size..=self.max_room_size);
            let room_height = rng.gen_range(self.min_room_size..=self.max_room_size);
            let x = rng.gen_range(1..width - room_width - 1);
            let y = rng.gen_range(1..height - room_height - 1);

            let new_room = Room::new(x, y, room_width, room_height);

            // Check if the room overlaps with any existing rooms
            let overlaps = dungeon.rooms.iter().any(|room| room.intersects(&new_room));

            if !overlaps {
                // If this is not the first room, connect it to the previous room
                if let Some(prev_room) = dungeon.rooms.last() {
                    let (prev_x, prev_y) = prev_room.center();
                    let (new_x, new_y) = new_room.center();
                    dungeon.create_corridor((prev_x, prev_y), (new_x, new_y));
                }

                dungeon.add_room(new_room);
            }

            attempts += 1;
        }

        // Add some doors at corridor intersections
        self.add_doors(&mut dungeon);

        dungeon
    }

    fn add_doors(&self, dungeon: &mut Dungeon) {
        let mut rng = rand::thread_rng();

        for y in 1..dungeon.height - 1 {
            for x in 1..dungeon.width - 1 {
                if dungeon.get_tile(x, y) == Some(TileType::Floor) {
                    // Check if this is a corridor intersection
                    let is_horizontal = 
                        dungeon.get_tile(x - 1, y) == Some(TileType::Floor) &&
                        dungeon.get_tile(x + 1, y) == Some(TileType::Floor);
                    let is_vertical = 
                        dungeon.get_tile(x, y - 1) == Some(TileType::Floor) &&
                        dungeon.get_tile(x, y + 1) == Some(TileType::Floor);

                    if is_horizontal && is_vertical && rng.gen_bool(0.2) {
                        dungeon.set_tile(x, y, TileType::Door);
                    }
                }
            }
        }
    }
} 