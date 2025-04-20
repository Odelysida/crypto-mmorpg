/** @jsxImportSource react */
import React, { useEffect, useRef, useState } from 'react';
import './GameCanvas.css';

interface Position {
    x: number;
    y: number;
}

interface Movement {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}

interface GameCanvasProps {
    socket: WebSocket | null;
    playerId: string;
}

const TILE_SIZE = 32;
const PLAYER_SIZE = 24;
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const PLAYER_SPEED = 5;

const GameCanvas: React.FC<GameCanvasProps> = ({ socket, playerId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 });
    const [movement, setMovement] = useState<Movement>({
        up: false,
        down: false,
        left: false,
        right: false
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            
            const key = e.key.toLowerCase();
            setMovement(prev => {
                switch (key) {
                    case 'w': return { ...prev, up: true };
                    case 's': return { ...prev, down: true };
                    case 'a': return { ...prev, left: true };
                    case 'd': return { ...prev, right: true };
                    default: return prev;
                }
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            setMovement(prev => {
                switch (key) {
                    case 'w': return { ...prev, up: false };
                    case 's': return { ...prev, down: false };
                    case 'a': return { ...prev, left: false };
                    case 'd': return { ...prev, right: false };
                    default: return prev;
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const movementInterval = setInterval(() => {
            if (movement.up || movement.down || movement.left || movement.right) {
                socket.send(JSON.stringify({
                    type: 'Move',
                    data: movement
                }));
            }
        }, 1000 / 60); // 60 FPS

        return () => clearInterval(movementInterval);
    }, [movement, socket]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'PlayerMoved' && message.data.id === playerId) {
                    setPlayerPosition(message.data.position);
                }
            } catch (error) {
                console.error('Error parsing position update:', error);
            }
        };

        socket.addEventListener('message', handleMessage);

        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket, playerId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            // Clear canvas
            ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

            // Calculate camera offset
            const cameraX = Math.max(VIEWPORT_WIDTH / 2, Math.min(playerPosition.x, VIEWPORT_WIDTH / 2));
            const cameraY = Math.max(VIEWPORT_HEIGHT / 2, Math.min(playerPosition.y, VIEWPORT_HEIGHT / 2));

            // Draw player shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(
                playerPosition.x - cameraX + VIEWPORT_WIDTH / 2,
                playerPosition.y - cameraY + VIEWPORT_HEIGHT / 2 + PLAYER_SIZE / 2,
                PLAYER_SIZE / 2,
                PLAYER_SIZE / 4,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Draw player
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(
                playerPosition.x - cameraX + VIEWPORT_WIDTH / 2,
                playerPosition.y - cameraY + VIEWPORT_HEIGHT / 2,
                PLAYER_SIZE / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        };

        const animationFrame = requestAnimationFrame(function animate() {
            render();
            requestAnimationFrame(animate);
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [playerPosition]);

    return (
        <div className="game-canvas-container">
            <canvas
                ref={canvasRef}
                width={VIEWPORT_WIDTH}
                height={VIEWPORT_HEIGHT}
                className="game-canvas"
            />
        </div>
    );
};

export default GameCanvas; 