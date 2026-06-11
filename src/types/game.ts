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

export type TournamentType = 'single' | 'bo3' | 'bo5' | 'bo7';

export interface MatchResult {
  round: number;
  winner: EntityType;
  duration: number;
}

export interface TournamentStats {
  totalRounds: number;
  averageRoundTime: number;
  longestRound: number;
  shortestRound: number;
  champion: EntityType | null;
}

export interface TournamentState {
  type: TournamentType;
  currentRound: number;
  wins: GameCounts;
  history: MatchResult[];
  champion: EntityType | null;
  stats: TournamentStats;
}

export interface GameState {
  counts: GameCounts;
  status: GameStatus;
  winner: EntityType | null;
  arenaShape: ArenaShape;
  stats: GameStats;
  events: BattleEvent[];
  simulationSpeed: number;
  tournament: TournamentState;
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
