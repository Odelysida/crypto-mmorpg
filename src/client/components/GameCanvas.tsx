import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import './GameCanvas.css';

interface GameCanvasProps {
  socket: Socket | null;
  player: any;
}

// Constants
const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 20;
const VIEWPORT_HEIGHT = 20;
const MOVEMENT_SPEED = 0.1;

// Define tile types
enum TileType {
  FLOOR = 0,
  WALL = 1,
  DOOR = 2,
}

interface Position {
  x: number;
  y: number;
}

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Movement {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

// Check if two rooms overlap
const doRoomsOverlap = (room1: Room, room2: Room): boolean => {
  return !(
    room1.x + room1.width + 1 < room2.x ||
    room2.x + room2.width + 1 < room1.x ||
    room1.y + room1.height + 1 < room2.y ||
    room2.y + room2.height + 1 < room1.y
  );
};

// Create a corridor between two rooms
const createCorridor = (
  dungeon: number[][],
  room1: Room,
  room2: Room
): void => {
  // Get center points of rooms
  const x1 = Math.floor(room1.x + room1.width / 2);
  const y1 = Math.floor(room1.y + room1.height / 2);
  const x2 = Math.floor(room2.x + room2.width / 2);
  const y2 = Math.floor(room2.y + room2.height / 2);

  // Create L-shaped corridor
  const horizontalFirst = Math.random() > 0.5;
  
  if (horizontalFirst) {
    // Horizontal then vertical
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      dungeon[y1][x] = TileType.FLOOR;
    }
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      dungeon[y][x2] = TileType.FLOOR;
    }
  } else {
    // Vertical then horizontal
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      dungeon[y][x1] = TileType.FLOOR;
    }
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      dungeon[y2][x] = TileType.FLOOR;
    }
  }
};

// Generate a random dungeon with multiple rooms
const generateDungeon = (width: number, height: number): number[][] => {
  const dungeon: number[][] = Array(height).fill(0).map(() => Array(width).fill(TileType.WALL));
  const rooms: Room[] = [];
  const numRooms = Math.floor(Math.random() * 5) + 5; // 5-10 rooms

  // Try to place rooms
  for (let i = 0; i < 100 && rooms.length < numRooms; i++) {
    const roomWidth = Math.floor(Math.random() * 4) + 4; // 4-7 tiles
    const roomHeight = Math.floor(Math.random() * 4) + 4; // 4-7 tiles
    const x = Math.floor(Math.random() * (width - roomWidth - 2)) + 1;
    const y = Math.floor(Math.random() * (height - roomHeight - 2)) + 1;

    const newRoom: Room = { x, y, width: roomWidth, height: roomHeight };

    // Check if room overlaps with existing rooms
    let overlaps = false;
    for (const room of rooms) {
      if (doRoomsOverlap(newRoom, room)) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      // Carve out room
      for (let ry = y; ry < y + roomHeight; ry++) {
        for (let rx = x; rx < x + roomWidth; rx++) {
          dungeon[ry][rx] = TileType.FLOOR;
        }
      }

      // Connect to previous room
      if (rooms.length > 0) {
        createCorridor(dungeon, rooms[rooms.length - 1], newRoom);
      }

      rooms.push(newRoom);
    }
  }

  // Add some doors at corridor intersections
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (dungeon[y][x] === TileType.FLOOR) {
        // Check if this is a corridor intersection
        const isHorizontalCorridor = 
          dungeon[y][x - 1] === TileType.FLOOR && 
          dungeon[y][x + 1] === TileType.FLOOR;
        const isVerticalCorridor = 
          dungeon[y - 1][x] === TileType.FLOOR && 
          dungeon[y + 1][x] === TileType.FLOOR;

        if (isHorizontalCorridor && isVerticalCorridor && Math.random() < 0.2) {
          dungeon[y][x] = TileType.DOOR;
        }
      }
    }
  }

  // Ensure player starting position is on a floor tile
  if (rooms.length > 0) {
    const startRoom = rooms[0];
    dungeon[startRoom.y + Math.floor(startRoom.height / 2)]
           [startRoom.x + Math.floor(startRoom.width / 2)] = TileType.FLOOR;
  }

  return dungeon;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ socket, player }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dungeon] = useState(() => generateDungeon(50, 50));
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  
  // Initialize player position in a valid floor tile
  const getInitialPlayerPosition = (): Position => {
    // First try to find the center of the first room
    if (dungeon && dungeon.length > 0) {
      // Start from the center and spiral outward to find a floor tile
      const centerY = Math.floor(dungeon.length / 2);
      const centerX = Math.floor(dungeon[0].length / 2);
      
      const spiral = [
        [0, 0], [0, 1], [1, 0], [0, -1], [-1, 0],  // immediate neighbors
        [1, 1], [1, -1], [-1, -1], [-1, 1],        // diagonals
        [0, 2], [2, 0], [0, -2], [-2, 0]           // extended neighbors
      ];

      for (const [offsetY, offsetX] of spiral) {
        const y = centerY + offsetY;
        const x = centerX + offsetX;
        
        if (y >= 0 && y < dungeon.length && 
            x >= 0 && x < dungeon[0].length && 
            dungeon[y][x] === TileType.FLOOR) {
          return {
            x: (x + 0.5) * TILE_SIZE,
            y: (y + 0.5) * TILE_SIZE
          };
        }
      }

      // If center area has no floor tiles, scan the whole dungeon
      for (let y = 0; y < dungeon.length; y++) {
        for (let x = 0; x < dungeon[0].length; x++) {
          if (dungeon[y][x] === TileType.FLOOR) {
            return {
              x: (x + 0.5) * TILE_SIZE,
              y: (y + 0.5) * TILE_SIZE
            };
          }
        }
      }
    }

    // Fallback position (should never happen with our dungeon generation)
    console.warn('No valid floor tile found for player spawn');
    return { x: TILE_SIZE * 2, y: TILE_SIZE * 2 };
  };

  const playerPosRef = useRef<Position>(getInitialPlayerPosition());
  const animationFrameRef = useRef<number>(0);
  const movementRef = useRef<Movement>({ up: false, down: false, left: false, right: false });

  // Handle player movement
  useEffect(() => {
    if (player && player.position) {
      playerPosRef.current = player.position;
    }
  }, [player]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault(); // Prevent default browser scrolling
      switch (e.key.toLowerCase()) {
        case 'w':
          movementRef.current.up = true;
          break;
        case 's':
          movementRef.current.down = true;
          break;
        case 'a':
          movementRef.current.left = true;
          break;
        case 'd':
          movementRef.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          movementRef.current.up = false;
          break;
        case 's':
          movementRef.current.down = false;
          break;
        case 'a':
          movementRef.current.left = false;
          break;
        case 'd':
          movementRef.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isWalkable = (x: number, y: number): boolean => {
      const tileX = Math.floor(x / TILE_SIZE);
      const tileY = Math.floor(y / TILE_SIZE);
      
      return tileY >= 0 && tileY < dungeon.length && 
             tileX >= 0 && tileX < dungeon[0].length &&
             (dungeon[tileY][tileX] === TileType.FLOOR || dungeon[tileY][tileX] === TileType.DOOR);
    };

    const updatePlayerPosition = () => {
      if (!socket) return;

      const movement = movementRef.current;
      let dx = 0;
      let dy = 0;

      if (movement.up) dy -= MOVEMENT_SPEED;
      if (movement.down) dy += MOVEMENT_SPEED;
      if (movement.left) dx -= MOVEMENT_SPEED;
      if (movement.right) dx += MOVEMENT_SPEED;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const factor = MOVEMENT_SPEED / Math.sqrt(2);
        dx = dx > 0 ? factor : -factor;
        dy = dy > 0 ? factor : -factor;
      }

      // Calculate new position
      const newX = playerPosRef.current.x + dx;
      const newY = playerPosRef.current.y + dy;

      // Check collision for both x and y movements separately
      const canMoveX = isWalkable(newX, playerPosRef.current.y);
      const canMoveY = isWalkable(playerPosRef.current.x, newY);

      // Update position based on available movements
      if (canMoveX) {
        playerPosRef.current.x = newX;
      }
      if (canMoveY) {
        playerPosRef.current.y = newY;
      }

      if (canMoveX || canMoveY) {
        socket.emit('player:move', playerPosRef.current);
      }
    };

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update player position
      updatePlayerPosition();

      // Update camera to follow player
      const targetCameraX = Math.floor(playerPosRef.current.x / TILE_SIZE - VIEWPORT_WIDTH / 2);
      const targetCameraY = Math.floor(playerPosRef.current.y / TILE_SIZE - VIEWPORT_HEIGHT / 2);
      setCamera({ x: targetCameraX, y: targetCameraY });

      // Draw visible portion of dungeon
      for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
        for (let x = 0; x < VIEWPORT_WIDTH; x++) {
          const worldX = x + camera.x;
          const worldY = y + camera.y;
          
          if (worldX >= 0 && worldX < dungeon[0].length && 
              worldY >= 0 && worldY < dungeon.length) {
            const tile = dungeon[worldY][worldX];
            
            // Draw tile
            ctx.fillStyle = tile === TileType.WALL ? '#444' : 
                           tile === TileType.DOOR ? '#852' : '#222';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Add detail to floor tiles
            if (tile === TileType.FLOOR) {
              ctx.fillStyle = '#2a2a2a';
              if (Math.random() < 0.1) {
                ctx.fillRect(
                  x * TILE_SIZE + Math.random() * TILE_SIZE / 2,
                  y * TILE_SIZE + Math.random() * TILE_SIZE / 2,
                  2, 2
                );
              }
            }
          }
        }
      }

      // Draw player
      const screenX = (playerPosRef.current.x / TILE_SIZE - camera.x) * TILE_SIZE;
      const screenY = (playerPosRef.current.y / TILE_SIZE - camera.y) * TILE_SIZE;
      
      // Draw player shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(
        screenX + TILE_SIZE / 2,
        screenY + TILE_SIZE - 4,
        TILE_SIZE / 3,
        TILE_SIZE / 6,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      // Draw player character
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(
        screenX + TILE_SIZE / 2,
        screenY + TILE_SIZE / 2,
        TILE_SIZE / 3,
        0, Math.PI * 2
      );
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dungeon, camera, socket]);

  return (
    <div className="game-canvas-container">
      <canvas
        ref={canvasRef}
        width={VIEWPORT_WIDTH * TILE_SIZE}
        height={VIEWPORT_HEIGHT * TILE_SIZE}
        className="game-canvas"
      />
    </div>
  );
};

export default GameCanvas; 