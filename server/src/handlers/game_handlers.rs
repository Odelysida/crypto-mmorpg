use actix_web::{web, HttpResponse};
use std::sync::Arc;
use parking_lot::RwLock;
use serde_json::json;

use crate::game::GameState;
use crate::error::GameError;

pub async fn get_game_state(
    game_state: web::Data<Arc<RwLock<GameState>>>,
) -> Result<HttpResponse, GameError> {
    let state = game_state.read();
    
    Ok(HttpResponse::Ok().json(json!({
        "players": state.get_players(),
        "dungeon": state.get_dungeon()
    })))
}

pub async fn get_dungeon(
    game_state: web::Data<Arc<RwLock<GameState>>>,
) -> Result<HttpResponse, GameError> {
    let state = game_state.read();
    
    Ok(HttpResponse::Ok().json(state.get_dungeon()))
} 