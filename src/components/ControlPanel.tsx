import React from 'react';
import type { GameCounts, PlayerNames, GameStatus } from '../types/game';

interface ControlPanelProps {
  counts: GameCounts;
  playerNames: PlayerNames;
  status: GameStatus;
  onCountsChange: (counts: GameCounts) => void;
  onNamesChange: (names: PlayerNames) => void;
  onStart: () => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  counts,
  playerNames,
  status,
  onCountsChange,
  onNamesChange,
  onStart,
  onReset,
}) => {
  const handleCountChange = (type: keyof GameCounts, value: string) => {
    const numValue = parseInt(value) || 0;
    onCountsChange({ ...counts, [type]: numValue });
  };

  const handleNameChange = (type: keyof PlayerNames, value: string) => {
    onNamesChange({ ...playerNames, [type]: value });
  };

  const isRunning = status === 'running';

  return (
    <div className="card control-panel">
      <h2 className="section-title">⚙️ Game Controls</h2>

      <div className="section">
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
          disabled={isRunning}
          className="btn btn-start"
        >
          {status === 'finished' ? 'Start New Battle' : 'Start Battle'}
        </button>
        <button onClick={onReset} className="btn btn-reset">
          Reset Arena
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
