use serde::{Serialize, Deserialize};

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

impl Room {
    pub fn new(x: i32, y: i32, width: i32, height: i32) -> Self {
        Self {
            x,
            y,
            width,
            height,
        }
    }

    pub fn center(&self) -> (i32, i32) {
        (
            self.x + self.width / 2,
            self.y + self.height / 2,
        )
    }

    pub fn intersects(&self, other: &Room) -> bool {
        !(self.x + self.width + 1 < other.x ||
          other.x + other.width + 1 < self.x ||
          self.y + self.height + 1 < other.y ||
          other.y + other.height + 1 < self.y)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dungeon {
    pub width: i32,
    pub height: i32,
    pub tiles: Vec<Vec<TileType>>,
    pub rooms: Vec<Room>,
}

impl Dungeon {
    pub fn new(width: i32, height: i32) -> Self {
        Self {
            width,
            height,
            tiles: vec![vec![TileType::Wall; width as usize]; height as usize],
            rooms: Vec::new(),
        }
    }

    pub fn get_tile(&self, x: i32, y: i32) -> Option<TileType> {
        if x >= 0 && x < self.width && y >= 0 && y < self.height {
            Some(self.tiles[y as usize][x as usize])
        } else {
            None
        }
    }

    pub fn set_tile(&mut self, x: i32, y: i32, tile_type: TileType) -> bool {
        if x >= 0 && x < self.width && y >= 0 && y < self.height {
            self.tiles[y as usize][x as usize] = tile_type;
            true
        } else {
            false
        }
    }

    pub fn add_room(&mut self, room: Room) {
        // Carve out the room
        for y in room.y..room.y + room.height {
            for x in room.x..room.x + room.width {
                self.set_tile(x, y, TileType::Floor);
            }
        }
        self.rooms.push(room);
    }

    pub fn create_corridor(&mut self, from: (i32, i32), to: (i32, i32)) {
        let (x1, y1) = from;
        let (x2, y2) = to;

        // Horizontal then vertical
        for x in x1.min(x2)..=x1.max(x2) {
            self.set_tile(x, y1, TileType::Floor);
        }
        for y in y1.min(y2)..=y1.max(y2) {
            self.set_tile(x2, y, TileType::Floor);
        }
    }
} 