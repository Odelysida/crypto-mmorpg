use thiserror::Error;
use actix_web::{HttpResponse, ResponseError};
use serde_json::json;

#[derive(Error, Debug)]
pub enum GameError {
    #[error("Player not found")]
    PlayerNotFound,
    
    #[error("Invalid movement: {0}")]
    InvalidMovement(String),
    
    #[error("Invalid position: {0}")]
    InvalidPosition(String),
    
    #[error("Database error: {0}")]
    DatabaseError(String),
    
    #[error("Internal server error: {0}")]
    InternalError(String),
}

impl ResponseError for GameError {
    fn error_response(&self) -> HttpResponse {
        match self {
            GameError::PlayerNotFound => {
                HttpResponse::NotFound().json(json!({
                    "error": "Player not found"
                }))
            }
            GameError::InvalidMovement(msg) => {
                HttpResponse::BadRequest().json(json!({
                    "error": format!("Invalid movement: {}", msg)
                }))
            }
            GameError::InvalidPosition(msg) => {
                HttpResponse::BadRequest().json(json!({
                    "error": format!("Invalid position: {}", msg)
                }))
            }
            GameError::DatabaseError(msg) => {
                HttpResponse::InternalServerError().json(json!({
                    "error": format!("Database error: {}", msg)
                }))
            }
            GameError::InternalError(msg) => {
                HttpResponse::InternalServerError().json(json!({
                    "error": format!("Internal server error: {}", msg)
                }))
            }
        }
    }
} 