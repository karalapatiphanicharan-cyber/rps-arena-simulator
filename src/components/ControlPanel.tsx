import React, { useState } from 'react';
import type {
    GameCounts,
    PlayerNames,
    GameStatus,
    ArenaShape,
    TournamentType,
    ObstacleDensity,
    TournamentState,
    ArenaPreset,
    CrazyEventName
} from '../types/game';
import CollapsibleSection from './CollapsibleSection';
import TournamentDashboard from './TournamentDashboard';
import ArenaBuilder, { type BuilderTool } from './ArenaBuilder';
import AdvancedSimulationPanel from './AdvancedSimulationPanel';
import DevPanel from './DevPanel';
import CrazyEventHistory from './CrazyEventHistory';

interface ControlPanelProps {
  counts: GameCounts;
  playerNames: PlayerNames;
  status: GameStatus;
  arenaShape: ArenaShape;
  simulationSpeed: number;
  tournamentType: TournamentType;
  tournamentState: TournamentState;
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
  // Random Modes
  onRandomBattle: () => void;
  onRandomTournament: () => void;
  onUltimateChaos: () => void;
  autoPlay: boolean;
  onAutoPlayToggle: (enabled: boolean) => void;
  // Arena Builder
  onLoadPreset: (preset: ArenaPreset) => void;
  onSaveArena: (name: string) => void;
  onClearArena: () => void;
  selectedTool: BuilderTool;
  onToolChange: (tool: BuilderTool) => void;
  isEditing: boolean;
  onEditingToggle: (enabled: boolean) => void;
  // Crazy History
  crazyHistory: CrazyEventName[];
  // Advanced Sim
  unitClassesEnabled: boolean;
  advancedAIEnabled: boolean;
  classDist: 'normal' | 'mixed' | 'random';
  aiDist: 'random' | 'smart' | 'mixed';
  onClassesToggle: (val: boolean) => void;
  onAIToggle: (val: boolean) => void;
  onClassDistChange: (val: any) => void;
  onAIDistChange: (val: any) => void;
  // Dev Tools
  onTriggerCrazyEvent: (name: CrazyEventName) => void;
  expandedStates: Record<string, boolean>;
  onToggleSection: (key: string, val: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  counts,
  playerNames,
  status,
  arenaShape,
  simulationSpeed,
  tournamentType,
  tournamentState,
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
  onRandomBattle,
  onRandomTournament,
  onUltimateChaos,
  autoPlay,
  onAutoPlayToggle,
  onLoadPreset,
  onSaveArena,
  onClearArena,
  selectedTool,
  onToolChange,
  isEditing,
  onEditingToggle,
  crazyHistory,
  unitClassesEnabled,
  advancedAIEnabled,
  classDist,
  aiDist,
  onClassesToggle,
  onAIToggle,
  onClassDistChange,
  onAIDistChange,
  onTriggerCrazyEvent,
  expandedStates,
  onToggleSection
}) => {
  const [countError, setCountError] = useState(false);
  const [crazyHistoryExpanded, setCrazyHistoryExpanded] = useState(false);

  const handleCountChange = (type: keyof GameCounts, value: string) => {
    // If user clears the input, we treat it as 0
    if (value === '') {
      setCountError(false);
      onCountsChange({ ...counts, [type]: 0 });
      return;
    }

    // Strictly allow only whole numbers (digits only)
    // Reject decimals, negative signs, letters, and scientific notation
    // We use a regex that matches only digits from start to end
    if (!/^\d+$/.test(value)) {
      // If it's not a valid whole number, we force the state to stay as is
      // but we need to trigger a re-render to clear the invalid character from the input
      // since it's a controlled component.
      onCountsChange({ ...counts });
      return;
    }

    let numValue = parseInt(value, 10);

    if (numValue > 75) {
      numValue = 75;
      setCountError(true);
    } else {
      setCountError(false);
    }

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
              className={`btn btn-start ${status === 'idle' ? 'idle-pulse' : ''}`}
            >
              Start Battle
            </button>
            <button onClick={onReset} className="btn btn-reset">
              Reset Arena
            </button>
          </div>
      </div>

      <CollapsibleSection
        title="Player Settings"
        expanded={expandedStates.players}
        onToggle={(v) => onToggleSection('players', v)}
        icon="👥"
      >
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
          <div className="entity-counts-row">
            <div className="input-group">
              <input
                type="text"
                inputMode="numeric"
                value={counts.rock}
                onChange={(e) => handleCountChange('rock', e.target.value)}
                disabled={isRunning}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                inputMode="numeric"
                value={counts.paper}
                onChange={(e) => handleCountChange('paper', e.target.value)}
                disabled={isRunning}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                inputMode="numeric"
                value={counts.scissors}
                onChange={(e) => handleCountChange('scissors', e.target.value)}
                disabled={isRunning}
                placeholder="0"
              />
            </div>
          </div>
          {countError && (
              <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: '600' }}>
                  Maximum allowed per entity type is 75.
              </p>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Arena Settings"
        expanded={expandedStates.arena}
        onToggle={(v) => onToggleSection('arena', v)}
        icon="🏟️"
      >
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
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
              <option value="2.5">2.5x</option>
              <option value="3">3x</option>
              <option value="3.5">3.5x</option>
              <option value="4">4x</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Game Controls"
        expanded={expandedStates.controls}
        onToggle={(v) => onToggleSection('controls', v)}
        icon="⚙️"
      >
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
          {crazyMode && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
                  <button
                    onClick={() => setCrazyHistoryExpanded(!crazyHistoryExpanded)}
                    className="btn"
                    style={{
                        background: 'none',
                        padding: 0,
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#94A3B8',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                    }}
                  >
                      <span>{crazyHistoryExpanded ? '▼' : '▶'} Crazy History</span>
                  </button>
                  {crazyHistoryExpanded && (
                      <div style={{ marginTop: '0.5rem' }}>
                          <CrazyEventHistory history={crazyHistory} />
                      </div>
                  )}
              </div>
          )}
        </div>
      </CollapsibleSection>

      {crazyMode && (
        <CollapsibleSection title="🛠 Developer Tools" defaultExpanded={false} icon="🛠️">
          <DevPanel onTriggerEvent={onTriggerCrazyEvent} enabled={crazyMode} />
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="🏆 Tournament"
        expanded={expandedStates.tournament}
        onToggle={(v) => onToggleSection('tournament', v)}
        icon="🏆"
      >
          <div className="section">
              <TournamentDashboard state={tournamentState} playerNames={playerNames} />
              <div className="input-group" style={{ marginTop: '1rem' }}>
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
              <button
                onClick={onResetTournament}
                className="btn"
                style={{ background: '#4B5563', color: 'white', width: '100%', marginTop: '1rem' }}
              >
                Restart Tournament
              </button>
          </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="⚔ Advanced Simulation"
        expanded={expandedStates.adv}
        onToggle={(v) => onToggleSection('adv', v)}
        icon="⚔"
      >
          <AdvancedSimulationPanel
            enabled={unitClassesEnabled}
            aiEnabled={advancedAIEnabled}
            classDist={classDist}
            aiDist={aiDist}
            onClassesToggle={onClassesToggle}
            onAIToggle={onAIToggle}
            onClassDistChange={onClassDistChange}
            onAIDistChange={onAIDistChange}
          />
      </CollapsibleSection>

      <CollapsibleSection
        title="🏗 Arena Builder"
        expanded={expandedStates.builder}
        onToggle={(v) => onToggleSection('builder', v)}
        icon="🏗️"
      >
        <ArenaBuilder
            onLoadPreset={onLoadPreset}
            onSaveArena={onSaveArena}
            onClearArena={onClearArena}
            currentShape={arenaShape}
            onShapeChange={onShapeChange}
            selectedTool={selectedTool}
            onToolChange={onToolChange}
            isEditing={isEditing}
            onEditingToggle={onEditingToggle}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="🎲 Random Modes"
        expanded={expandedStates.random}
        onToggle={(v) => onToggleSection('random', v)}
        icon="🎲"
      >
          <div className="section">
              <div className="button-group" style={{ marginTop: 0 }}>
                  <button
                      onClick={onRandomBattle}
                      className="btn"
                      style={{ background: '#8B5CF6', color: 'white' }}
                      disabled={status === 'running' || status === 'paused'}
                  >
                      Random Battle
                  </button>
                  <button
                      onClick={onRandomTournament}
                      className="btn"
                      style={{ background: '#EC4899', color: 'white' }}
                      disabled={status === 'running' || status === 'paused'}
                  >
                      Random Tournament
                  </button>
              </div>
              <button
                  onClick={onUltimateChaos}
                  className="btn"
                  style={{ background: 'linear-gradient(45deg, #EF4444, #8B5CF6)', color: 'white', width: '100%', marginTop: '0.5rem', fontWeight: '800' }}
                  disabled={status === 'running' || status === 'paused'}
              >
                  🎲 Ultimate Chaos Mode
              </button>
              <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <label style={{ margin: 0, fontSize: '0.8rem' }}>▶ Auto Play</label>
                <button
                  onClick={() => onAutoPlayToggle(!autoPlay)}
                  className="btn"
                  style={{
                      background: autoPlay ? '#10B981' : '#374151',
                      padding: '0.25rem 0.75rem',
                      minWidth: '60px',
                      fontSize: '0.7rem'
                  }}
                >
                  {autoPlay ? 'ON' : 'OFF'}
                </button>
              </div>
          </div>
      </CollapsibleSection>
    </div>
  );
};

export default ControlPanel;
