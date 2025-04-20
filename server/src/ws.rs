+
/// WebSocket module for handling real-time game communication
use actix::{Actor, StreamHandler, ActorContext};
use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use std::sync::Arc;
use parking_lot::RwLock;
use serde_json::json;
use crate::game::GameState;

/// WebSocket connection handler for Socket.IO protocol
pub struct GameWebSocket {
    /// Shared game state accessible across all connections
    game_state: Arc<RwLock<GameState>>,
    /// Player ID associated with this connection
    player_id: Option<String>,
}

impl Actor for GameWebSocket {
    /// Specifies the context type for the WebSocket actor
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        // Send Socket.IO handshake
        let handshake = json!({
            "type": "open",
            "sid": "server-generated-session-id",
            "upgrades": [],
            "pingInterval": 25000,
            "pingTimeout": 5000
        });
        ctx.text(format!("0{}", handshake.to_string()));
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for GameWebSocket {
    /// Handles incoming WebSocket messages from clients
    /// 
    /// # Arguments
    /// * `msg` - The incoming message wrapped in a Result
    /// * `ctx` - The WebSocket context for sending responses
    /// 
    /// # Message Types
    /// * `Ping` - Responds with a pong to keep the connection alive
    /// * `Text` - Handles text-based game commands and chat messages
    /// * `Binary` - Processes binary data (currently echoes back)
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                ctx.pong(&msg);
            }
            Ok(ws::Message::Text(text)) => {
                // Handle Socket.IO messages
                if text.starts_with("2") {
                    // Socket.IO ping
                    ctx.text("3");
                } else if text.starts_with("4") {
                    // Socket.IO message
                    let payload = &text[1..];
                    if let Ok(value) = serde_json::from_str(payload) {
                        self.handle_socket_message(value, ctx);
                    }
                }
            }
            Ok(ws::Message::Binary(bin)) => {
                ctx.binary(bin);
            }
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => {}
        }
    }
}

impl GameWebSocket {
    fn handle_socket_message(&mut self, message: serde_json::Value, ctx: &mut ws::WebsocketContext<Self>) {
        if let Some(event) = message.get("event").and_then(|v| v.as_str()) {
            match event {
                "equipItem" => {
                    // Handle equip item event
                    if let Some(data) = message.get("data") {
                        // Process equip item logic here
                        let response = json!({
                            "type": "message",
                            "event": "equipItem",
                            "data": {
                                "success": true
                            }
                        });
                        ctx.text(format!("42{}", response.to_string()));
                    }
                }
                "unequipItem" => {
                    // Handle unequip item event
                    if let Some(data) = message.get("data") {
                        // Process unequip item logic here
                        let response = json!({
                            "type": "message",
                            "event": "unequipItem",
                            "data": {
                                "success": true
                            }
                        });
                        ctx.text(format!("42{}", response.to_string()));
                    }
                }
                "useItem" => {
                    // Handle use item event
                    if let Some(data) = message.get("data") {
                        // Process use item logic here
                        let response = json!({
                            "type": "message",
                            "event": "useItem",
                            "data": {
                                "success": true
                            }
                        });
                        ctx.text(format!("42{}", response.to_string()));
                    }
                }
                "dropItem" => {
                    // Handle drop item event
                    if let Some(data) = message.get("data") {
                        // Process drop item logic here
                        let response = json!({
                            "type": "message",
                            "event": "dropItem",
                            "data": {
                                "success": true
                            }
                        });
                        ctx.text(format!("42{}", response.to_string()));
                    }
                }
                _ => {}
            }
        }
    }
}

/// WebSocket connection handler
/// 
/// Establishes a new WebSocket connection for a client and sets up the communication channel.
/// 
/// # Arguments
/// * `req` - The HTTP request that initiated the WebSocket connection
/// * `stream` - The payload stream for the WebSocket connection
/// * `game_state` - Shared game state accessible by all connections
/// 
/// # Returns
/// * `Result<HttpResponse, Error>` - The result of establishing the WebSocket connection
pub async fn ws_index(
    req: HttpRequest,
    stream: web::Payload,
    game_state: web::Data<Arc<RwLock<GameState>>>,
) -> Result<HttpResponse, Error> {
    let ws = GameWebSocket {
        game_state: game_state.get_ref().clone(),
        player_id: None,
    };
    ws::start(ws, &req, stream)
} 