import React from 'react';
import type { GameCounts, PlayerNames, GameStatus, ArenaShape, TournamentType } from '../types/game';

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
    <div className="card control-panel">
      <h2 className="section-title">⚙️ Game Controls</h2>

      <div className="section">
        <h3 className="section-subtitle" style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>Game Mode</h3>
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

      <div className="section" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-subtitle" style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>Arena Settings</h3>
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

      <div className="section" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-subtitle" style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>Player Names</h3>
        <div className="input-group">
          <label>Rock Name</label>
          <input
            type="text"
            value={playerNames.rock}
            onChange={(e) => handleNameChange('rock', e.target.value)}
            disabled={isRunning}
            placeholder="Enter rock name..."
          />
        </div>
        <div className="input-group">
          <label>Paper Name</label>
          <input
            type="text"
            value={playerNames.paper}
            onChange={(e) => handleNameChange('paper', e.target.value)}
            disabled={isRunning}
            placeholder="Enter paper name..."
          />
        </div>
        <div className="input-group">
          <label>Scissors Name</label>
          <input
            type="text"
            value={playerNames.scissors}
            onChange={(e) => handleNameChange('scissors', e.target.value)}
            disabled={isRunning}
            placeholder="Enter scissors name..."
          />
        </div>
      </div>

      <div className="section" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-subtitle" style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>Entity Counts</h3>
        <div className="input-group">
          <label>Rock Count</label>
          <input
            type="number"
            value={counts.rock}
            onChange={(e) => handleCountChange('rock', e.target.value)}
            disabled={isRunning}
            min="0"
          />
        </div>
        <div className="input-group">
          <label>Paper Count</label>
          <input
            type="number"
            value={counts.paper}
            onChange={(e) => handleCountChange('paper', e.target.value)}
            disabled={isRunning}
            min="0"
          />
        </div>
        <div className="input-group">
          <label>Scissors Count</label>
          <input
            type="number"
            value={counts.scissors}
            onChange={(e) => handleCountChange('scissors', e.target.value)}
            disabled={isRunning}
            min="0"
          />
        </div>
      </div>

      <div className="button-group">
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
  );
};

export default ControlPanel;
