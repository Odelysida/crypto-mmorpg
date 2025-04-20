use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::time::SystemTime;

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
    pub strength: i32,
    pub dexterity: i32,
    pub intelligence: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallet {
    pub address: String,
    pub balance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: Uuid,
    pub username: String,
    pub position: Position,
    pub stats: Stats,
    pub wallet: Wallet,
    pub last_active: SystemTime,
    pub experience: u32,
    pub level: u32,
}

impl Player {
    pub fn new(id: Uuid, username: String, wallet_address: String) -> Self {
        Self {
            id,
            username,
            position: Position { x: 0.0, y: 0.0 },
            stats: Stats {
                health: 100,
                max_health: 100,
                mana: 100,
                max_mana: 100,
                strength: 10,
                dexterity: 10,
                intelligence: 10,
            },
            wallet: Wallet {
                address: wallet_address,
                balance: 0.0,
            },
            last_active: SystemTime::now(),
            experience: 0,
            level: 1,
        }
    }

    pub fn update_position(&mut self, x: f32, y: f32) {
        self.position.x = x;
        self.position.y = y;
        self.last_active = SystemTime::now();
    }

    pub fn update_stats(&mut self, health: i32, mana: i32) {
        self.stats.health = health.clamp(0, self.stats.max_health);
        self.stats.mana = mana.clamp(0, self.stats.max_mana);
        self.last_active = SystemTime::now();
    }

    pub fn add_experience(&mut self, exp: u32) {
        self.experience += exp;
        // Simple leveling formula: level = sqrt(experience / 100)
        self.level = ((self.experience as f32 / 100.0).sqrt() as u32).max(1);
    }

    pub fn update_wallet(&mut self, balance: f64) {
        self.wallet.balance = balance;
        self.last_active = SystemTime::now();
    }
} 