import { useState, useRef, useEffect, useCallback } from 'react';
import './styles.css';
import type {
    GameCounts,
    PlayerNames,
    GameStatus,
    EntityType,
    ArenaShape,
    GameState
} from './types/game';
import { GameEngine } from './game/GameEngine';
import ControlPanel from './components/ControlPanel';
import ScoreBoard from './components/ScoreBoard';
import WinnerModal from './components/WinnerModal';
import ProgressIndicator from './components/ProgressIndicator';
import BattleFeed from './components/BattleFeed';
import { soundManager } from './game/SoundManager';

const ARENA_WIDTH = 1000;
const ARENA_HEIGHT = 600;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [counts, setCounts] = useState<GameCounts>({
    rock: 30,
    paper: 30,
    scissors: 30,
  });

  const [playerNames, setPlayerNames] = useState<PlayerNames>({
    rock: 'Rock',
    paper: 'Paper',
    scissors: 'Scissors',
  });

  const [arenaShape, setArenaShape] = useState<ArenaShape>('rectangle');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    soundManager.setEnabled(!isMuted);
  }, [isMuted]);

  const [gameState, setGameState] = useState<GameState>({
    counts: { rock: 0, paper: 0, scissors: 0 },
    status: 'idle',
    winner: null,
    arenaShape: 'rectangle',
    simulationSpeed: 1,
    events: [],
    stats: {
        totalCollisions: 0,
        totalConversions: 0,
        counts: { rock: 0, paper: 0, scissors: 0 },
        elapsedTime: 0,
        arenaShape: 'rectangle'
    }
  });

  const handleStateChange = useCallback((state: GameState) => {
      setGameState(state);
  }, []);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        engineRef.current = new GameEngine(
          ctx,
          { width: ARENA_WIDTH, height: ARENA_HEIGHT },
          handleStateChange
        );
      }
    }
  }, [handleStateChange]);

  const handleStart = () => {
    if (engineRef.current) {
      engineRef.current.setArenaShape(arenaShape);
      engineRef.current.spawn(counts);
      engineRef.current.start();
    }
  };

  const handlePause = () => {
    if (engineRef.current) engineRef.current.pause();
  };

  const handleResume = () => {
    if (engineRef.current) engineRef.current.start();
  };

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset();
    }
  };

  const handleRestart = () => {
    handleReset();
    handleStart();
  };

  const handleShapeChange = (shape: ArenaShape) => {
      setArenaShape(shape);
      if (engineRef.current) {
          engineRef.current.setArenaShape(shape);
          engineRef.current.reset();
      }
  };

  const handleSpeedChange = (speed: number) => {
      setSimulationSpeed(speed);
      if (engineRef.current) {
          engineRef.current.setSimulationSpeed(speed);
      }
  };

  const currentCounts = gameState.status === 'idle' ? counts : gameState.counts;
  const totalEntities = currentCounts.rock + currentCounts.paper + currentCounts.scissors;
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="app-container">
      <header>
        <h1>🎮 RPS ARENA ROYALE</h1>
        <p className="subtitle">Real-Time Rock Paper Scissors Battle Simulator</p>
      </header>

      <main className="main-layout">
        <aside className="control-panel-column">
          <ControlPanel
            counts={counts}
            playerNames={playerNames}
            status={gameState.status}
            arenaShape={arenaShape}
            simulationSpeed={simulationSpeed}
            onCountsChange={setCounts}
            onNamesChange={setPlayerNames}
            onShapeChange={handleShapeChange}
            onSpeedChange={handleSpeedChange}
            onStart={handleStart}
            onReset={handleReset}
          />
          <BattleFeed events={gameState.events} />

          <div className="card" style={{ marginTop: '1rem' }}>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="btn"
                style={{ width: '100%', background: isMuted ? '#4B5563' : '#10B981' }}
              >
                {isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON'}
              </button>
          </div>
        </aside>

        <section className="arena-section">
          <div className="card spectator-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1rem' }}>
             <button
                onClick={handleResume}
                disabled={gameState.status !== 'paused'}
                className="btn btn-start"
                style={{ flex: 1 }}
             >
               ▶ Resume
             </button>
             <button
                onClick={handlePause}
                disabled={gameState.status !== 'running'}
                className="btn"
                style={{ flex: 1, background: '#F59E0B' }}
             >
               ⏸ Pause
             </button>
             <button
                onClick={handleRestart}
                className="btn btn-reset"
                style={{ flex: 1 }}
             >
               🔄 Restart
             </button>
          </div>

          <div className="arena-header">
            <h2 className="section-title">⚔ Battle Arena: {capitalize(arenaShape)}</h2>
            <div className="stat-badge">
              Total Entities: <strong>{totalEntities}</strong>
            </div>
          </div>
          <div className="arena-container">
            <canvas
              ref={canvasRef}
              width={ARENA_WIDTH}
              height={ARENA_HEIGHT}
            />
          </div>

          <div className="card" style={{ marginTop: '1rem' }}>
              <ProgressIndicator counts={currentCounts} />
          </div>
        </section>

        <aside className="scoreboard-column">
          <ScoreBoard
            playerNames={playerNames}
            stats={gameState.stats}
          />
        </aside>
      </main>

      <WinnerModal
        winner={gameState.winner}
        counts={gameState.counts}
        playerNames={playerNames}
        stats={gameState.stats}
        onRestart={handleRestart}
      />
    </div>
  );
}

export default App;
