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
    <div className="control-panel">
      <h2>Controls</h2>

      <div className="section">
        <h3>Player Names</h3>
        <div className="input-group">
          <label>Rock Name</label>
          <input
            type="text"
            value={playerNames.rock}
            onChange={(e) => handleNameChange('rock', e.target.value)}
            disabled={isRunning}
          />
        </div>
        <div className="input-group">
          <label>Paper Name</label>
          <input
            type="text"
            value={playerNames.paper}
            onChange={(e) => handleNameChange('paper', e.target.value)}
            disabled={isRunning}
          />
        </div>
        <div className="input-group">
          <label>Scissors Name</label>
          <input
            type="text"
            value={playerNames.scissors}
            onChange={(e) => handleNameChange('scissors', e.target.value)}
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="section">
        <h3>Entity Counts</h3>
        <div className="input-group">
          <label>Rock Count</label>
          <input
            type="number"
            value={counts.rock}
            onChange={(e) => handleCountChange('rock', e.target.value)}
            disabled={isRunning}
          />
        </div>
        <div className="input-group">
          <label>Paper Count</label>
          <input
            type="number"
            value={counts.paper}
            onChange={(e) => handleCountChange('paper', e.target.value)}
            disabled={isRunning}
          />
        </div>
        <div className="input-group">
          <label>Scissors Count</label>
          <input
            type="number"
            value={counts.scissors}
            onChange={(e) => handleCountChange('scissors', e.target.value)}
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="button-group">
        <button onClick={onStart} disabled={isRunning} className="start-btn">
          Start Battle
        </button>
        <button onClick={onReset} className="reset-btn">
          Reset Battle
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
