# Crypto Realms - Fantasy MMORPG with Crypto Integration

A modern browser-based MMORPG that combines fantasy gaming with cryptocurrency integration. Built with TypeScript, React, and Rust.

## Features

- 🎮 Real-time multiplayer gameplay with WebSocket communication
- 🗺️ Procedurally generated dungeons with rooms and corridors
- 🎯 Smooth player movement with WASD controls
- 💰 Integrated crypto wallet system
- 🎒 Inventory management system
- 📊 Player stats tracking
- 💬 Real-time chat system
- 🖼️ Draggable UI windows
- 🎨 Fantasy-themed UI with retro styling

## Tech Stack

### Frontend (TypeScript + React)
- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Socket.IO Client** - WebSocket communication
- **HTML5 Canvas** - Game rendering
- **CSS3** - Styling with fantasy theme

### Backend (Rust)
- **Actix-web** - Web framework
- **WebSocket** - Real-time communication
- **Parking_lot** - Concurrent state management
- **Serde** - Serialization/Deserialization
- **UUID** - Unique identifiers

## Project Structure

```
crypto-realms/
├── src/
│   └── client/                 # Frontend React application
│       ├── components/         # React components
│       │   ├── GameCanvas.tsx  # Main game rendering
│       │   ├── Chat.tsx       # Chat system
│       │   ├── Inventory.tsx  # Inventory management
│       │   ├── PlayerStats.tsx # Player statistics
│       │   ├── Wallet.tsx    # Crypto wallet integration
│       │   └── ...
│       └── App.tsx            # Main application component
├── server/                    # Rust backend
│   ├── src/
│   │   ├── main.rs           # Server entry point
│   │   ├── game.rs           # Game state and logic
│   │   ├── ws.rs             # WebSocket handler
│   │   ├── types.rs          # Shared type definitions
│   │   ├── error.rs          # Error handling
│   │   └── handlers/         # API route handlers
│   └── Cargo.toml            # Rust dependencies
└── package.json              # Frontend dependencies
```

## Key Components

### Frontend Components
- **GameCanvas**: Renders the game world, handles player movement and interactions
- **Chat**: Real-time player communication
- **Inventory**: Item management interface
- **PlayerStats**: Character statistics display
- **Wallet**: Cryptocurrency wallet integration
- **DraggableWindow**: Reusable draggable UI component

### Backend Systems
- **GameState**: Manages game world state and player data
- **WebSocket Handler**: Real-time communication management
- **Dungeon Generation**: Procedural dungeon creation system
- **Player Management**: Handles player sessions and data

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Rust (latest stable)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crypto-realms.git
cd crypto-realms
```

2. Install frontend dependencies:
```bash
npm install
```

3. Build and run the Rust server:
```bash
cd server
cargo build
cargo run
```

4. In a new terminal, start the frontend development server:
```bash
npm run dev
```

The game will be available at `http://localhost:5173` with the backend running on `http://localhost:3000`.

## Development

### Running in Development Mode
1. Start the Rust server: `cd server && cargo run`
2. Start the frontend dev server: `npm run dev`

### Building for Production
1. Build the frontend: `npm run build`
2. Build the server: `cd server && cargo build --release`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by classic MMORPGs
- Built with modern web technologies
- Special thanks to the open-source community 