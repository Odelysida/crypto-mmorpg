import { Player } from './Player';

export interface GameState {
  players: Map<string, Player>;
  world: {
    time: number;
    weather: string;
    events: GameEvent[];
  };
}

export interface GameEvent {
  id: string;
  type: 'combat' | 'trade' | 'quest' | 'weather';
  data: any;
  timestamp: number;
} 