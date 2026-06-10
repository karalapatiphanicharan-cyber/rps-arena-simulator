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

  const handleStart = () => {
    if (engineRef.current) {
      engineRef.current.spawn(counts);
      engineRef.current.start();
    }
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

  return (
    <div className="app-container">
      <header>
        <h1>RPS ARENA ROYALE</h1>
      </header>

      <main className="main-layout">
        <ControlPanel
          counts={counts}
          playerNames={playerNames}
          status={gameState.status}
          onCountsChange={setCounts}
          onNamesChange={setPlayerNames}
          onStart={handleStart}
          onReset={handleReset}
        />

        <div className="arena-container">
          <canvas
            ref={canvasRef}
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
          />
        </div>

        <ScoreBoard
          counts={gameState.status === 'idle' ? counts : gameState.counts}
          playerNames={playerNames}
        />
      </main>

      <WinnerModal
        winner={gameState.winner}
        counts={gameState.counts}
        playerNames={playerNames}
        onRestart={handleRestart}
      />
    </div>
  );
}

export default App;
