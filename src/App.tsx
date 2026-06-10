import { useState, useRef, useEffect } from 'react';
import './styles.css';
import type { GameCounts, PlayerNames, GameStatus, EntityType } from './types/game';
import { GameEngine } from './game/GameEngine';
import ControlPanel from './components/ControlPanel';
import ScoreBoard from './components/ScoreBoard';
import WinnerModal from './components/WinnerModal';
import { motion } from 'framer-motion';

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
      <div className="background-decorations">
        {/* Simple decorative elements */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '10rem', transform: 'rotate(-15deg)' }}>⚡</div>
        <div style={{ position: 'absolute', top: '70%', left: '2%', fontSize: '8rem', transform: 'rotate(10deg)' }}>★</div>
        <div style={{ position: 'absolute', top: '15%', right: '5%', fontSize: '12rem', transform: 'rotate(20deg)' }}>✷</div>
        <div style={{ position: 'absolute', bottom: '10%', right: '8%', fontSize: '9rem', transform: 'rotate(-10deg)' }}>⚡</div>
        <div style={{ position: 'absolute', top: '45%', left: '50%', fontSize: '15rem', opacity: 0.05 }}>RPS</div>
      </div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <h1>RPS ARENA ROYALE</h1>
      </motion.header>

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

        <motion.div
          className="arena-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <div className="arena-corner corner-tl"></div>
          <div className="arena-corner corner-tr"></div>
          <div className="arena-corner corner-bl"></div>
          <div className="arena-corner corner-br"></div>
          <div className="arena-grid-overlay"></div>
          <canvas
            ref={canvasRef}
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
          />
        </motion.div>

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
