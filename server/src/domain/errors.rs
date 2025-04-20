use std::fmt;
use actix_web::{HttpResponse, ResponseError};
use serde_json::json;

#[derive(Debug)]
pub enum GameError {
    PlayerNotFound,
    InvalidPosition(String),
    InvalidItem(String),
    InsufficientFunds(String),
    DatabaseError(String),
    SerializationError(String),
}

impl fmt::Display for GameError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            GameError::PlayerNotFound => write!(f, "Player not found"),
            GameError::InvalidPosition(msg) => write!(f, "Invalid position: {}", msg),
            GameError::InvalidItem(msg) => write!(f, "Invalid item: {}", msg),
            GameError::InsufficientFunds(msg) => write!(f, "Insufficient funds: {}", msg),
            GameError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            GameError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
        }
    }
}

impl ResponseError for GameError {
    fn error_response(&self) -> HttpResponse {
        match self {
            GameError::PlayerNotFound => {
                HttpResponse::NotFound().json(json!({
                    "error": "Player not found",
                    "code": "PLAYER_NOT_FOUND"
                }))
            }
            GameError::InvalidPosition(msg) => {
                HttpResponse::BadRequest().json(json!({
                    "error": format!("Invalid position: {}", msg),
                    "code": "INVALID_POSITION"
                }))
            }
            GameError::InvalidItem(msg) => {
                HttpResponse::BadRequest().json(json!({
                    "error": format!("Invalid item: {}", msg),
                    "code": "INVALID_ITEM"
                }))
            }
            GameError::InsufficientFunds(msg) => {
                HttpResponse::BadRequest().json(json!({
                    "error": format!("Insufficient funds: {}", msg),
                    "code": "INSUFFICIENT_FUNDS"
                }))
            }
            GameError::DatabaseError(msg) => {
                HttpResponse::InternalServerError().json(json!({
                    "error": format!("Database error: {}", msg),
                    "code": "DATABASE_ERROR"
                }))
            }
            GameError::SerializationError(msg) => {
                HttpResponse::InternalServerError().json(json!({
                    "error": format!("Serialization error: {}", msg),
                    "code": "SERIALIZATION_ERROR"
                }))
            }
        }
    }
} 