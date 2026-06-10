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

export interface GameState {
  entities: EntityData[];
  counts: GameCounts;
  status: GameStatus;
  winner: EntityType | null;
  playerNames: PlayerNames;
  arenaShape: ArenaShape;
}

export interface ArenaDimensions {
  width: number;
  height: number;
}
