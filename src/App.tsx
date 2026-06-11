import { useState, useRef, useEffect, useCallback } from 'react';
import './styles.css';
import type {
    GameCounts,
    PlayerNames,
    ArenaShape,
    GameState,
    TournamentType,
    TournamentState,
    CrazyEventName,
    ObstacleDensity
} from './types/game';
import { GameEngine } from './game/GameEngine';
import { TournamentManager } from './game/TournamentManager';
import ControlPanel from './components/ControlPanel';
import ScoreBoard from './components/ScoreBoard';
import WinnerModal from './components/WinnerModal';
import ProgressIndicator from './components/ProgressIndicator';
import BattleFeed from './components/BattleFeed';
import TournamentDashboard from './components/TournamentDashboard';
import MatchHistory from './components/MatchHistory';
import CrazyEventBanner from './components/CrazyEventBanner';
import CrazyEventHistory from './components/CrazyEventHistory';
import DevPanel from './components/DevPanel';
import CollapsibleSection from './components/CollapsibleSection';
import { soundManager } from './game/SoundManager';

const ARENA_WIDTH = 1000;
const ARENA_HEIGHT = 600;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const nextRoundTimerRef = useRef<number | null>(null);

  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);

  const [counts, setCounts] = useState<GameCounts>({
    rock: 10,
    paper: 10,
    scissors: 10,
  });

  const [playerNames, setPlayerNames] = useState<PlayerNames>({
    rock: 'Rock',
    paper: 'Paper',
    scissors: 'Scissors',
  });

  const [arenaShape, setArenaShape] = useState<ArenaShape>('rectangle');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [tournamentType, setTournamentType] = useState<TournamentType>('single');
  const [tournamentState, setTournamentState] = useState<TournamentState>(
    TournamentManager.getInitialState('single')
  );
  const [crazyMode, setCrazyMode] = useState(false);
  const [obstacles, setObstacles] = useState<ObstacleDensity>('off');
  const [powerZones, setPowerZones] = useState(false);

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
        arenaShape: 'rectangle',
        obstacleCollisions: 0,
        speedZoneVisits: 0,
        slowZoneVisits: 0,
        chaosZoneVisits: 0
    },
    tournament: tournamentState,
    obstacles: 'off',
    powerZones: false,
    crazyMode: {
        enabled: false,
        activeEvent: null,
        history: [],
        stats: {
            eventsTriggered: 0,
            meteorEliminations: 0,
            freezeCount: 0,
            speedBoostActivations: 0,
            ruleReversals: 0
        }
    }
  });

  const handleStateChange = useCallback((state: GameState) => {
      setGameState(prevState => ({
          ...state,
          tournament: prevState.tournament
      }));
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
      if (nextRoundTimerRef.current) {
          clearTimeout(nextRoundTimerRef.current);
          nextRoundTimerRef.current = null;
      }
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
      if (nextRoundTimerRef.current) {
          clearTimeout(nextRoundTimerRef.current);
          nextRoundTimerRef.current = null;
      }
    }
  };

  const handleResetTournament = () => {
      const newState = TournamentManager.getInitialState(tournamentType);
      setTournamentState(newState);
      setGameState(prev => ({ ...prev, tournament: newState }));
      handleReset();
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

  const handleCrazyModeToggle = (enabled: boolean) => {
      setCrazyMode(enabled);
      if (engineRef.current) {
          engineRef.current.setCrazyMode(enabled);
      }
  };

  const handleObstaclesChange = (density: ObstacleDensity) => {
      setObstacles(density);
      if (engineRef.current) {
          engineRef.current.setObstacles(density);
      }
  };

  const handlePowerZonesToggle = (enabled: boolean) => {
      setPowerZones(enabled);
      if (engineRef.current) {
          engineRef.current.setPowerZones(enabled);
      }
  };

  const handleTriggerCrazyEvent = (name: CrazyEventName) => {
      if (engineRef.current) {
          engineRef.current.triggerCrazyEvent(name);
      }
  };

  const handleTournamentTypeChange = (type: TournamentType) => {
      setTournamentType(type);
      const newState = TournamentManager.getInitialState(type);
      setTournamentState(newState);
      setGameState(prev => ({ ...prev, tournament: newState }));
      handleReset();
  };

  // Detect round finish and handle tournament logic
  useEffect(() => {
      if (gameState.status === 'finished' && gameState.winner && !nextRoundTimerRef.current) {
          const newState = TournamentManager.addRoundResult(
              tournamentState,
              gameState.winner,
              gameState.stats.elapsedTime
          );
          setTournamentState(newState);
          setGameState(prev => ({ ...prev, tournament: newState }));

          if (!newState.champion) {
              // Automatic next round after 3 seconds
              nextRoundTimerRef.current = window.setTimeout(() => {
                  nextRoundTimerRef.current = null;
                  handleRestart();
              }, 3000);
          }
      }
  }, [gameState.status, gameState.winner]);

  const currentCounts = gameState.status === 'idle' ? counts : gameState.counts;
  const totalEntities = currentCounts.rock + currentCounts.paper + currentCounts.scissors;
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="app-container">
      <header>
        <h1>🎮 RPS ARENA ROYALE</h1>
        <p className="subtitle">Real-Time Rock Paper Scissors Battle Simulator</p>
      </header>

      <div className="mobile-drawer-controls">
        <button className="btn" onClick={() => setShowLeftDrawer(true)}>⚙️ Controls</button>
        <button className="btn" onClick={() => setShowRightDrawer(true)}>📊 Stats</button>
      </div>

      <main className="main-layout">
        <aside className={`control-panel-column ${showLeftDrawer ? 'mobile-visible' : ''}`}>
          <div className="drawer-header">
            <h3>Game Controls</h3>
            <button className="close-drawer" onClick={() => setShowLeftDrawer(false)}>×</button>
          </div>
          <ControlPanel
            counts={counts}
            playerNames={playerNames}
            status={gameState.status}
            arenaShape={arenaShape}
            simulationSpeed={simulationSpeed}
            tournamentType={tournamentType}
            onCountsChange={setCounts}
            onNamesChange={setPlayerNames}
            onShapeChange={handleShapeChange}
            onSpeedChange={handleSpeedChange}
            onTournamentTypeChange={handleTournamentTypeChange}
            onStart={handleStart}
            onReset={handleReset}
            onResetTournament={handleResetTournament}
            crazyMode={crazyMode}
            onCrazyModeToggle={handleCrazyModeToggle}
            obstacles={obstacles}
            onObstaclesChange={handleObstaclesChange}
            powerZones={powerZones}
            onPowerZonesToggle={handlePowerZonesToggle}
          />

          <CollapsibleSection title="Tournament Info" defaultExpanded={tournamentState.type !== 'single'} icon="🏁">
            <TournamentDashboard state={tournamentState} playerNames={playerNames} />
          </CollapsibleSection>

          <CollapsibleSection title="Crazy History" defaultExpanded={false} icon="📜">
            <CrazyEventHistory history={gameState.crazyMode.history} />
          </CollapsibleSection>

          {crazyMode && (
            <CollapsibleSection title="Dev Tools" defaultExpanded={false} icon="🛠️">
              <DevPanel onTriggerEvent={handleTriggerCrazyEvent} enabled={crazyMode} />
            </CollapsibleSection>
          )}

          <div className="card mute-card">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="btn mute-btn"
                style={{ background: isMuted ? '#4B5563' : '#10B981' }}
              >
                {isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON'}
              </button>
          </div>
        </aside>

        { (showLeftDrawer || showRightDrawer) && <div className="drawer-overlay" onClick={() => { setShowLeftDrawer(false); setShowRightDrawer(false); }}></div> }

        <section className="arena-section">
          {tournamentState.type !== 'single' && (
              <div className="tournament-info-bar card">
                  <div className="round-counter">
                      Round <strong>{tournamentState.currentRound}</strong> / {TournamentManager.getWinsNeeded(tournamentState.type) * 2 - 1} (Max)
                  </div>
                  <div className="tournament-wins">
                      {Object.entries(tournamentState.wins).map(([type, wins]) => (
                          <div key={type} className={`win-badge ${type}`}>
                              {wins}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <div className="card spectator-controls">
             <button
                onClick={handleResume}
                disabled={gameState.status !== 'paused'}
                className="btn btn-start"
             >
               ▶ Resume
             </button>
             <button
                onClick={handlePause}
                disabled={gameState.status !== 'running'}
                className="btn btn-pause"
             >
               ⏸ Pause
             </button>
             <button
                onClick={handleRestart}
                className="btn btn-reset"
             >
               🔄 Restart Round
             </button>
          </div>

          <CrazyEventBanner event={gameState.crazyMode.activeEvent} />

          <div className="arena-header">
            <h2 className="section-title arena-title">⚔ Battle Arena: {capitalize(arenaShape)}</h2>
            <div className="stat-badge arena-stat-badge">
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

          <div className="card progress-card">
              <ProgressIndicator counts={currentCounts} />
          </div>
        </section>

        <aside className={`scoreboard-column ${showRightDrawer ? 'mobile-visible' : ''}`}>
          <div className="drawer-header">
            <h3>Live Stats</h3>
            <button className="close-drawer" onClick={() => setShowRightDrawer(false)}>×</button>
          </div>
          <ScoreBoard
            playerNames={playerNames}
            stats={gameState.stats}
            tournament={tournamentState}
          />

          <CollapsibleSection title="Match History" defaultExpanded={false} icon="📋">
            <MatchHistory history={tournamentState.history} playerNames={playerNames} />
          </CollapsibleSection>

          <CollapsibleSection title="Battle Feed" defaultExpanded={false} icon="⚡">
            <BattleFeed events={gameState.events} />
          </CollapsibleSection>
        </aside>
      </main>

      <WinnerModal
        winner={gameState.winner}
        counts={gameState.counts}
        playerNames={playerNames}
        stats={gameState.stats}
        tournament={tournamentState}
        onRestart={handleRestart}
        onResetTournament={handleResetTournament}
      />
    </div>
  );
}

export default App;
