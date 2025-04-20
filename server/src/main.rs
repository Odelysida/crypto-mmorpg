mod game;
mod types;
mod error;
mod handlers;
mod ws;

use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use std::sync::Arc;
use parking_lot::RwLock;
use log::info;

use crate::game::GameState;
use crate::handlers::{
    player_handlers,
    game_handlers,
};
use crate::ws::ws_index;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logging
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    // Initialize game state
    let game_state = Arc::new(RwLock::new(GameState::new()));
    
    info!("Starting game server on 127.0.0.1:3000");
    
    // Start HTTP server
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);
            
        App::new()
            .wrap(cors)
            .app_data(web::Data::new(game_state.clone()))
            // WebSocket route
            .route("/socket.io/", web::get().to(ws_index))
            // Player routes
            .service(web::scope("/api/player")
                .route("/{id}", web::get().to(player_handlers::get_player))
                .route("/{id}/move", web::post().to(player_handlers::move_player))
                .route("/{id}/inventory", web::get().to(player_handlers::get_inventory))
                .route("/{id}/wallet", web::get().to(player_handlers::get_wallet)))
            // Game routes
            .service(web::scope("/api/game")
                .route("/state", web::get().to(game_handlers::get_game_state))
                .route("/dungeon", web::get().to(game_handlers::get_dungeon)))
    })
    .bind("127.0.0.1:3000")?
    .run()
    .await
} 