export type EntityType = 'rock' | 'paper' | 'scissors';

export type ArenaShape = 'rectangle' | 'square' | 'circle' | 'triangle' | 'hexagon';

export interface EntityData {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  type: EntityType;
}

export interface GameCounts {
  rock: number;
  paper: number;
  scissors: number;
}

export interface PlayerNames {
  rock: string;
  paper: string;
  scissors: string;
}

export type GameStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface BattleEvent {
  id: string;
  type: 'conversion';
  winner: EntityType;
  loser: EntityType;
  timestamp: number;
}

export interface GameStats {
  totalCollisions: number;
  totalConversions: number;
  counts: GameCounts;
  elapsedTime: number;
  arenaShape: ArenaShape;
}

export interface GameState {
  counts: GameCounts;
  status: GameStatus;
  winner: EntityType | null;
  arenaShape: ArenaShape;
  stats: GameStats;
  events: BattleEvent[];
  simulationSpeed: number;
}

export interface ArenaDimensions {
  width: number;
  height: number;
}

export interface VisualEffect {
  id: string;
  x: number;
  y: number;
  type: 'collision' | 'conversion';
  startTime: number;
  duration: number;
  color?: string;
}
