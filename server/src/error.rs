/// Error handling module for the game server
use thiserror::Error;
use actix_web::{HttpResponse, ResponseError};
use serde_json::json;

/// Represents all possible errors that can occur in the game server
/// 
/// This enum implements both the standard Error trait and Actix's ResponseError,
/// allowing for automatic conversion of errors into HTTP responses.
#[derive(Error, Debug)]
pub enum GameError {
    /// Error when a requested player cannot be found
    #[error("Player not found")]
    PlayerNotFound,
    
    /// Error when an invalid movement is attempted
    /// 
    /// # Arguments
    /// * String - Description of why the movement was invalid
    #[error("Invalid movement: {0}")]
    InvalidMovement(String),
    
    /// Error when a position is outside valid bounds or in an invalid tile
    /// 
    /// # Arguments
    /// * String - Description of why the position was invalid
    #[error("Invalid position: {0}")]
    InvalidPosition(String),
    
    /// Error when a database operation fails
    /// 
    /// # Arguments
    /// * String - Description of the database error
    #[error("Database error: {0}")]
    DatabaseError(String),
    
    /// Error for unexpected internal server issues
    /// 
    /// # Arguments
    /// * String - Description of the internal error
    #[error("Internal server error: {0}")]
    InternalError(String),
}

impl ResponseError for GameError {
    /// Converts a GameError into an appropriate HTTP response
    /// 
    /// Maps different error types to appropriate HTTP status codes and
    /// formats the error message as a JSON response.
    /// 
    /// # Returns
    /// An HttpResponse containing a JSON error message
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