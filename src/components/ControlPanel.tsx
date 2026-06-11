import React from 'react';
import type { GameCounts, PlayerNames, GameStatus, ArenaShape, TournamentType, ObstacleDensity } from '../types/game';
import CollapsibleSection from './CollapsibleSection';

interface ControlPanelProps {
  counts: GameCounts;
  playerNames: PlayerNames;
  status: GameStatus;
  arenaShape: ArenaShape;
  simulationSpeed: number;
  tournamentType: TournamentType;
  onCountsChange: (counts: GameCounts) => void;
  onNamesChange: (names: PlayerNames) => void;
  onShapeChange: (shape: ArenaShape) => void;
  onSpeedChange: (speed: number) => void;
  onTournamentTypeChange: (type: TournamentType) => void;
  onStart: () => void;
  onReset: () => void;
  onResetTournament: () => void;
  crazyMode: boolean;
  onCrazyModeToggle: (enabled: boolean) => void;
  obstacles: ObstacleDensity;
  onObstaclesChange: (density: ObstacleDensity) => void;
  powerZones: boolean;
  onPowerZonesToggle: (enabled: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  counts,
  playerNames,
  status,
  arenaShape,
  simulationSpeed,
  tournamentType,
  onCountsChange,
  onNamesChange,
  onShapeChange,
  onSpeedChange,
  onTournamentTypeChange,
  onStart,
  onReset,
  onResetTournament,
  crazyMode,
  onCrazyModeToggle,
  obstacles,
  onObstaclesChange,
  powerZones,
  onPowerZonesToggle,
}) => {
  const handleCountChange = (type: keyof GameCounts, value: string) => {
    const numValue = parseInt(value) || 0;
    onCountsChange({ ...counts, [type]: numValue });
  };

  const handleNameChange = (type: keyof PlayerNames, value: string) => {
    onNamesChange({ ...playerNames, [type]: value });
  };

  const isRunning = status === 'running' || status === 'paused';

  return (
    <div className="control-panel">
      <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="button-group" style={{ marginTop: 0 }}>
            <button
              onClick={onStart}
              disabled={status === 'running' || status === 'paused'}
              className="btn btn-start"
            >
              Start Battle
            </button>
            <button onClick={onReset} className="btn btn-reset">
              Reset Arena
            </button>
            <button onClick={onResetTournament} className="btn" style={{ background: '#4B5563', color: 'white' }}>
              Restart Tournament
            </button>
          </div>
      </div>

      <CollapsibleSection title="Game Controls" defaultExpanded icon="⚙️">
        <div className="section">
          <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ margin: 0 }}>Crazy Mode</label>
            <button
              onClick={() => onCrazyModeToggle(!crazyMode)}
              className="btn"
              style={{
                  background: crazyMode ? '#F97316' : '#374151',
                  padding: '0.4rem 1rem',
                  minWidth: '80px'
              }}
            >
              {crazyMode ? 'ON 🎭' : 'OFF'}
            </button>
          </div>

          <div className="input-group">
            <label>Tournament Type</label>
            <select
              value={tournamentType}
              onChange={(e) => onTournamentTypeChange(e.target.value as TournamentType)}
              disabled={status === 'running' || status === 'paused'}
              className="modern-select"
            >
              <option value="single">Single Match</option>
              <option value="bo3">Best of 3</option>
              <option value="bo5">Best of 5</option>
              <option value="bo7">Best of 7</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Arena Settings" defaultExpanded={false} icon="🏟️">
        <div className="section">
          <div className="input-group">
            <label>Obstacles</label>
            <select
              value={obstacles}
              onChange={(e) => onObstaclesChange(e.target.value as ObstacleDensity)}
              className="modern-select"
              disabled={status === 'running' || status === 'paused'}
            >
              <option value="off">OFF</option>
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
            </select>
          </div>

          <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
            <label style={{ margin: 0 }}>Power Zones</label>
            <button
              onClick={() => onPowerZonesToggle(!powerZones)}
              className="btn"
              style={{
                  background: powerZones ? '#A855F7' : '#374151',
                  padding: '0.4rem 1rem',
                  minWidth: '80px'
              }}
              disabled={status === 'running' || status === 'paused'}
            >
              {powerZones ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="input-group">
            <label>Arena Shape</label>
            <select
              value={arenaShape}
              onChange={(e) => onShapeChange(e.target.value as ArenaShape)}
              disabled={status === 'running' || status === 'paused'}
              className="modern-select"
            >
              <option value="rectangle">Rectangle</option>
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="triangle">Triangle</option>
              <option value="hexagon">Hexagon</option>
            </select>
          </div>

          <div className="input-group" style={{ marginTop: '1rem' }}>
            <label>Simulation Speed</label>
            <select
              value={simulationSpeed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="modern-select"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Player Settings" defaultExpanded icon="👥">
        <div className="section">
          <h3 className="section-subtitle" style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '0.5rem' }}>Player Names</h3>
          <div className="input-group">
            <input
              type="text"
              value={playerNames.rock}
              onChange={(e) => handleNameChange('rock', e.target.value)}
              disabled={isRunning}
              placeholder="Rock name"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              value={playerNames.paper}
              onChange={(e) => handleNameChange('paper', e.target.value)}
              disabled={isRunning}
              placeholder="Paper name"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              value={playerNames.scissors}
              onChange={(e) => handleNameChange('scissors', e.target.value)}
              disabled={isRunning}
              placeholder="Scissors name"
            />
          </div>

          <h3 className="section-subtitle" style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '0.5rem', marginTop: '1rem' }}>Entity Counts</h3>
          <div className="input-group">
            <input
              type="number"
              value={counts.rock}
              onChange={(e) => handleCountChange('rock', e.target.value)}
              disabled={isRunning}
              min="0"
            />
          </div>
          <div className="input-group">
            <input
              type="number"
              value={counts.paper}
              onChange={(e) => handleCountChange('paper', e.target.value)}
              disabled={isRunning}
              min="0"
            />
          </div>
          <div className="input-group">
            <input
              type="number"
              value={counts.scissors}
              onChange={(e) => handleCountChange('scissors', e.target.value)}
              disabled={isRunning}
              min="0"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ControlPanel;
