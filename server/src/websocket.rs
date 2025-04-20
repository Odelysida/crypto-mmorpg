use actix::{Actor, StreamHandler, Handler, Message, ActorContext};
use actix_web_actors::ws;
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::{Arc, Mutex};
use crate::game::GameState;
use crate::types::{Player, Position, Movement};

#[derive(Message)]
#[rtype(result = "()")]
pub struct WsMessage(pub String);

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum ClientMessage {
    Join { name: String },
    Move(Movement),
    Chat { message: String },
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum ServerMessage {
    Welcome { player: Player },
    PlayerJoined { player: Player },
    PlayerLeft { id: Uuid },
    PlayerMoved { id: Uuid, position: Position },
    ChatMessage { sender: String, message: String },
    Error { message: String },
}

pub struct WsGameSession {
    pub id: Uuid,
    pub game_state: Arc<Mutex<GameState>>,
}

impl Actor for WsGameSession {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsGameSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Text(text)) => {
                match serde_json::from_str::<ClientMessage>(&text) {
                    Ok(client_msg) => {
                        match client_msg {
                            ClientMessage::Join { name } => {
                                let mut game_state = self.game_state.lock().unwrap();
                                match game_state.add_player(self.id, &name) {
                                    Ok(player) => {
                                        // Send welcome message to new player
                                        let welcome = ServerMessage::Welcome { player: player.clone() };
                                        ctx.text(serde_json::to_string(&welcome).unwrap());
                                        
                                        // Broadcast join to other players
                                        let joined = ServerMessage::PlayerJoined { player };
                                        game_state.broadcast_message(&serde_json::to_string(&joined).unwrap());
                                    }
                                    Err(e) => {
                                        let error = ServerMessage::Error { message: e.to_string() };
                                        ctx.text(serde_json::to_string(&error).unwrap());
                                    }
                                }
                            }
                            ClientMessage::Move(movement) => {
                                let mut game_state = self.game_state.lock().unwrap();
                                if let Some(new_pos) = game_state.update_player_position(self.id, movement) {
                                    let moved = ServerMessage::PlayerMoved {
                                        id: self.id,
                                        position: new_pos,
                                    };
                                    game_state.broadcast_message(&serde_json::to_string(&moved).unwrap());
                                }
                            }
                            ClientMessage::Chat { message } => {
                                let game_state = self.game_state.lock().unwrap();
                                if let Some(player) = game_state.get_player(self.id) {
                                    let chat = ServerMessage::ChatMessage {
                                        sender: player.name.clone(),
                                        message,
                                    };
                                    game_state.broadcast_message(&serde_json::to_string(&chat).unwrap());
                                }
                            }
                        }
                    }
                    Err(e) => {
                        let error = ServerMessage::Error {
                            message: format!("Invalid message format: {}", e),
                        };
                        ctx.text(serde_json::to_string(&error).unwrap());
                    }
                }
            }
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Pong(_)) => {}
            Ok(ws::Message::Binary(_)) => {}
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            Ok(ws::Message::Continuation(_)) => {}
            Ok(ws::Message::Nop) => {}
            Err(e) => {
                println!("Error: {}", e);
                ctx.stop();
            }
        }
    }
}

impl Handler<WsMessage> for WsGameSession {
    type Result = ();

    fn handle(&mut self, msg: WsMessage, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

impl WsGameSession {
    pub fn new(game_state: Arc<Mutex<GameState>>) -> Self {
        Self {
            id: Uuid::new_v4(),
            game_state,
        }
    }
}

impl actix::Actor for WsGameSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, _ctx: &mut Self::Context) {
        println!("WebSocket connection established");
    }

    fn stopped(&mut self, _ctx: &mut Self::Context) {
        println!("WebSocket connection closed");
        let mut game_state = self.game_state.lock().unwrap();
        game_state.remove_player(self.id);
        let left = ServerMessage::PlayerLeft { id: self.id };
        game_state.broadcast_message(&serde_json::to_string(&left).unwrap());
    }
} 