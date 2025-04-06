import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  exp: number;
  maxExp: number;
  level: number;
  faction: string;
  inventory: any[];
  wallet: {
    address: string;
    balance: number;
  };
}

interface GameState {
  players: Map<string, Player>;
}

export class GameServer {
  private io: Server;
  private gameState: GameState;

  constructor(io: Server) {
    this.io = io;
    this.gameState = {
      players: new Map()
    };

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Player connected: ${socket.id}`);

      // Create initial player state
      const player: Player = {
        id: socket.id,
        name: `Player ${socket.id.slice(0, 4)}`,
        position: { x: Math.random() * 800, y: Math.random() * 600 },
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        exp: 0,
        maxExp: 1000,
        level: 1,
        faction: 'neutral',
        inventory: [
          {
            id: '1',
            name: 'Training Sword',
            type: 'weapon',
            rarity: 'common',
            value: 10,
            attributes: [
              { name: 'Attack', value: 5 }
            ]
          }
        ],
        wallet: {
          address: `0x${socket.id.slice(0, 40)}`,
          balance: 0.1
        }
      };

      // Add player to game state
      this.gameState.players.set(socket.id, player);

      // Send initial game state to player
      socket.emit('gameState', {
        player: this.gameState.players.get(socket.id)
      });

      // Handle player movement
      socket.on('player:move', (position: { x: number; y: number }) => {
        const player = this.gameState.players.get(socket.id);
        if (player) {
          player.position = position;
          this.io.emit('gameState:update', {
            players: Array.from(this.gameState.players.values())
          });
        }
      });

      // Handle chat messages
      socket.on('chat:message', (message: any) => {
        const player = this.gameState.players.get(socket.id);
        if (player) {
          this.io.emit('chat:message', {
            id: Math.random().toString(36).substr(2, 9),
            sender: player.name,
            content: message.content,
            timestamp: Date.now(),
            type: 'user'
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        this.gameState.players.delete(socket.id);
        this.io.emit('gameState:update', {
          players: Array.from(this.gameState.players.values())
        });
      });
    });
  }
} 