import { useState, useRef, useEffect } from 'react';
import './styles.css';
import type { GameCounts, PlayerNames, GameStatus, EntityType } from './types/game';
import { GameEngine } from './game/GameEngine';
import ControlPanel from './components/ControlPanel';
import ScoreBoard from './components/ScoreBoard';
import WinnerModal from './components/WinnerModal';

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

  const [gameState, setGameState] = useState<{
    status: GameStatus;
    counts: GameCounts;
    winner: EntityType | null;
  }>({
    status: 'idle',
    counts: { rock: 0, paper: 0, scissors: 0 },
    winner: null,
  });

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        engineRef.current = new GameEngine(
          ctx,
          { width: ARENA_WIDTH, height: ARENA_HEIGHT },
          (state) => {
            setGameState(state);
          }
        );
      }
    }
  }, []);

  useEffect(() => {
    if (gameState.status === 'running') {
      const startTime = Date.now() - elapsedTime * 1000;
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status]);

  const handleStart = () => {
    if (engineRef.current) {
      setElapsedTime(0);
      engineRef.current.spawn(counts);
      engineRef.current.start();
    }
  };

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      setElapsedTime(0);
    }
  };

  const handleRestart = () => {
    handleReset();
    handleStart();
  };

  const totalEntities = gameState.status === 'idle'
    ? counts.rock + counts.paper + counts.scissors
    : gameState.counts.rock + gameState.counts.paper + gameState.counts.scissors;

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
            onCountsChange={setCounts}
            onNamesChange={setPlayerNames}
            onStart={handleStart}
            onReset={handleReset}
          />
        </aside>

        <section className="arena-section">
          <div className="arena-header">
            <h2 className="section-title">⚔ Battle Arena</h2>
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
        </section>

        <aside className="scoreboard-column">
          <ScoreBoard
            counts={gameState.status === 'idle' ? counts : gameState.counts}
            playerNames={playerNames}
            elapsedTime={elapsedTime}
            totalEntities={totalEntities}
          />
        </aside>
      </main>

      <WinnerModal
        winner={gameState.winner}
        counts={gameState.counts}
        playerNames={playerNames}
        elapsedTime={elapsedTime}
        onRestart={handleRestart}
      />
    </div>
  );
}

export default App;
