use actix_web::{web, HttpResponse};
use uuid::Uuid;
use std::sync::Arc;
use parking_lot::RwLock;
use serde_json::json;

use crate::game::GameState;
use crate::types::{Position, MoveRequest};
use crate::error::GameError;

pub async fn get_player(
    game_state: web::Data<Arc<RwLock<GameState>>>,
    path: web::Path<String>,
) -> Result<HttpResponse, GameError> {
    let id = Uuid::parse_str(&path.into_inner())
        .map_err(|_| GameError::InvalidPosition("Invalid player ID".to_string()))?;
        
    let state = game_state.read();
    let player = state.get_player(id)
        .ok_or(GameError::PlayerNotFound)?;
        
    Ok(HttpResponse::Ok().json(player))
}

pub async fn move_player(
    game_state: web::Data<Arc<RwLock<GameState>>>,
    path: web::Path<String>,
    move_req: web::Json<MoveRequest>,
) -> Result<HttpResponse, GameError> {
    let id = Uuid::parse_str(&path.into_inner())
        .map_err(|_| GameError::InvalidPosition("Invalid player ID".to_string()))?;
        
    let new_pos = Position {
        x: move_req.x,
        y: move_req.y,
    };
    
    let mut state = game_state.write();
    state.update_player_position(id, new_pos)?;
    
    Ok(HttpResponse::Ok().finish())
}

pub async fn get_inventory(
    game_state: web::Data<Arc<RwLock<GameState>>>,
    path: web::Path<String>,
) -> Result<HttpResponse, GameError> {
    let id = Uuid::parse_str(&path.into_inner())
        .map_err(|_| GameError::InvalidPosition("Invalid player ID".to_string()))?;
        
    let state = game_state.read();
    let player = state.get_player(id)
        .ok_or(GameError::PlayerNotFound)?;
        
    Ok(HttpResponse::Ok().json(&player.inventory))
}

pub async fn get_wallet(
    game_state: web::Data<Arc<RwLock<GameState>>>,
    path: web::Path<String>,
) -> Result<HttpResponse, GameError> {
    let id = Uuid::parse_str(&path.into_inner())
        .map_err(|_| GameError::InvalidPosition("Invalid player ID".to_string()))?;
        
    let state = game_state.read();
    let player = state.get_player(id)
        .ok_or(GameError::PlayerNotFound)?;
        
    Ok(HttpResponse::Ok().json(json!({
        "address": player.wallet_address,
        "balance": player.balance
    })))
} 