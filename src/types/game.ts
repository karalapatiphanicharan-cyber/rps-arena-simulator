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

export type CrazyEventName =
  | 'Speed Boost'
  | 'Freeze Wave'
  | 'Double Population'
  | 'Meteor Strike'
  | 'Reverse Rules'
  | 'Giant Entity'
  | 'Chaos Storm';

export interface CrazyEvent {
  id: string;
  name: CrazyEventName;
  icon: string;
  color: string;
  startTime: number;
  duration: number;
  data?: any;
}

export interface CrazyModeStats {
  eventsTriggered: number;
  meteorEliminations: number;
  freezeCount: number;
  speedBoostActivations: number;
  ruleReversals: number;
}

export interface CrazyModeState {
  enabled: boolean;
  activeEvent: CrazyEvent | null;
  history: CrazyEventName[];
  stats: CrazyModeStats;
}

export interface GameStats {
  totalCollisions: number;
  totalConversions: number;
  counts: GameCounts;
  elapsedTime: number;
  arenaShape: ArenaShape;
  crazyMode?: CrazyModeStats;
  obstacleCollisions: number;
  speedZoneVisits: number;
  slowZoneVisits: number;
  chaosZoneVisits: number;
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

export type ObstacleDensity = 'off' | 'low' | 'medium' | 'high';

export interface Obstacle {
  id: string;
  type: 'wall' | 'boulder' | 'moving';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  velocityX?: number;
  velocityY?: number;
}

export interface PowerZone {
  id: string;
  type: 'speed' | 'slow' | 'chaos';
  x: number;
  y: number;
  radius: number;
}

export interface MatchSummary {
    id: string;
    arenaShape: ArenaShape;
    winner: EntityType;
    duration: number;
    conversions: number;
    collisions: number;
    timestamp: number;
}

export interface ArenaPreset {
    name: string;
    shape: ArenaShape;
    obstacles: Obstacle[];
    powerZones: PowerZone[];
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
  crazyMode: CrazyModeState;
  obstacles: ObstacleDensity;
  powerZones: boolean;
  autoPlay: boolean;
  manualObstacles: Obstacle[];
  manualPowerZones: PowerZone[];
}

export interface ArenaDimensions {
  width: number;
  height: number;
}

export interface VisualEffect {
  id: string;
  x: number;
  y: number;
  type: 'collision' | 'conversion' | 'explosion' | 'meteor_warning';
  startTime: number;
  duration: number;
  color?: string;
  radius?: number;
}
