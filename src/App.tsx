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
    ObstacleDensity,
    MatchSummary,
    Obstacle,
    PowerZone,
    ArenaPreset
} from './types/game';
import { GameEngine } from './game/GameEngine';
import { TournamentManager } from './game/TournamentManager';
import ControlPanel from './components/ControlPanel';
import CollapsibleSection from './components/CollapsibleSection';
import ScoreBoard from './components/ScoreBoard';
import WinnerModal from './components/WinnerModal';
import ProgressIndicator from './components/ProgressIndicator';
import BattleFeed from './components/BattleFeed';
import MatchHistory from './components/MatchHistory';
import CrazyEventBanner from './components/CrazyEventBanner';
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
  const [isMuted, setIsMuted] = useState(false);
  const [tournamentType, setTournamentType] = useState<TournamentType>('single');
  const [tournamentState, setTournamentState] = useState<TournamentState>(
    TournamentManager.getInitialState('single')
  );
  const [crazyMode, setCrazyMode] = useState(false);
  const [obstacles, setObstacles] = useState<ObstacleDensity>('off');
  const [powerZones, setPowerZones] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchSummary[]>(() => {
      const saved = localStorage.getItem('rps_match_history');
      return saved ? JSON.parse(saved) : [];
  });

  // State for GameState notifications
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
    autoPlay: false,
    manualObstacles: [],
    manualPowerZones: [],
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

  // Refs for state that engine needs access to via callback
  const tournamentStateRef = useRef(tournamentState);
  const autoPlayRef = useRef(autoPlay);

  useEffect(() => {
      tournamentStateRef.current = tournamentState;
  }, [tournamentState]);

  useEffect(() => {
      autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  const handleStateChange = useCallback((state: GameState) => {
      setGameState({
          ...state,
          tournament: tournamentStateRef.current,
          autoPlay: autoPlayRef.current
      });
  }, []);

  // Initialize engine once
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

  useEffect(() => {
      localStorage.setItem('rps_match_history', JSON.stringify(matchHistory.slice(0, 20)));
  }, [matchHistory]);

  useEffect(() => {
    soundManager.setEnabled(!isMuted);
  }, [isMuted]);

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !engineRef.current) return;

      const handleContextMenu = (e: MouseEvent) => {
          e.preventDefault();
          if (!engineRef.current) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const obj = engineRef.current.getObjectAt(x, y);
          if (obj) {
              if (obj.type === 'obstacle') {
                  engineRef.current.setManualFeatures(
                      gameState.manualObstacles.filter(o => o.id !== obj.id),
                      gameState.manualPowerZones
                  );
              } else {
                  engineRef.current.setManualFeatures(
                      gameState.manualObstacles,
                      gameState.manualPowerZones.filter(z => z.id !== obj.id)
                  );
              }
          }
      };

      const handleClick = (e: MouseEvent) => {
          if (e.button !== 0) return; // Only left click
          if (!engineRef.current || (gameState.status !== 'idle' && gameState.status !== 'finished')) return;

          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (engineRef.current.getObjectAt(x, y)) return;

          // Add random object
          const type = Math.random() > 0.5 ? 'obstacle' : 'zone';
          if (type === 'obstacle') {
              const obsType = (['wall', 'boulder', 'moving'] as const)[Math.floor(Math.random() * 3)];
              const newObs: Obstacle = {
                  id: `manual-obs-${Date.now()}`,
                  type: obsType,
                  x, y,
                  width: obsType === 'wall' ? 40 + Math.random() * 60 : undefined,
                  height: obsType === 'wall' ? 20 + Math.random() * 30 : undefined,
                  radius: obsType !== 'wall' ? 20 + Math.random() * 20 : undefined,
                  velocityX: obsType === 'moving' ? (Math.random() - 0.5) * 2 : undefined,
                  velocityY: obsType === 'moving' ? (Math.random() - 0.5) * 2 : undefined
              };
              engineRef.current.setManualFeatures(
                  [...gameState.manualObstacles, newObs],
                  gameState.manualPowerZones
              );
          } else {
              const zoneType = (['speed', 'slow', 'chaos'] as const)[Math.floor(Math.random() * 3)];
              const newZone: PowerZone = {
                  id: `manual-zone-${Date.now()}`,
                  type: zoneType,
                  x, y,
                  radius: 40 + Math.random() * 40
              };
              engineRef.current.setManualFeatures(
                  gameState.manualObstacles,
                  [...gameState.manualPowerZones, newZone]
              );
          }
      };

      canvas.addEventListener('contextmenu', handleContextMenu);
      canvas.addEventListener('mousedown', handleClick);
      return () => {
          canvas.removeEventListener('contextmenu', handleContextMenu);
          canvas.removeEventListener('mousedown', handleClick);
      };
  }, [gameState.status, gameState.manualObstacles, gameState.manualPowerZones]);

  const handleStart = (skipFeatureGeneration: boolean = false) => {
    if (engineRef.current) {
      if (nextRoundTimerRef.current) {
          clearTimeout(nextRoundTimerRef.current);
          nextRoundTimerRef.current = null;
      }
      engineRef.current.setArenaShape(arenaShape);
      engineRef.current.spawn(counts, skipFeatureGeneration);
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

  const handleRestart = (skipFeatureGeneration: boolean = false) => {
    handleReset();
    handleStart(skipFeatureGeneration);
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

  const handleLoadPreset = (preset: ArenaPreset) => {
      setArenaShape(preset.shape);
      if (engineRef.current) {
          engineRef.current.setArenaShape(preset.shape);
          engineRef.current.setManualFeatures(preset.obstacles, preset.powerZones);
          engineRef.current.reset();
      }
  };

  const handleSaveArena = (name: string) => {
      if (engineRef.current) {
          const state = gameState;
          const customArena: ArenaPreset = {
              name,
              shape: arenaShape,
              obstacles: state.manualObstacles,
              powerZones: state.manualPowerZones
          };
          const saved = localStorage.getItem('rps_custom_arenas');
          const customArenas = saved ? JSON.parse(saved) : [];
          localStorage.setItem('rps_custom_arenas', JSON.stringify([...customArenas, customArena]));
      }
  };

  const handleClearArena = () => {
      if (engineRef.current) {
          engineRef.current.setManualFeatures([], []);
      }
  };

  const handleTournamentTypeChange = (type: TournamentType) => {
      setTournamentType(type);
      const newState = TournamentManager.getInitialState(type);
      setTournamentState(newState);
      setGameState(prev => ({ ...prev, tournament: newState }));
      handleReset();
  };

  const handleRandomBattle = useCallback(() => {
      const shapes: ArenaShape[] = ['rectangle', 'square', 'circle', 'triangle', 'hexagon'];
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      const randomCounts = {
          rock: Math.floor(Math.random() * 96) + 5,
          paper: Math.floor(Math.random() * 96) + 5,
          scissors: Math.floor(Math.random() * 96) + 5
      };
      const densities: ObstacleDensity[] = ['off', 'low', 'medium', 'high'];
      const randomDensity = densities[Math.floor(Math.random() * densities.length)];
      const randomPowerZones = Math.random() > 0.5;
      const randomCrazy = Math.random() > 0.7;
      const speeds = [0.5, 1, 2, 4];
      const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];

      setArenaShape(randomShape);
      setCounts(randomCounts);
      setObstacles(randomDensity);
      setPowerZones(randomPowerZones);
      setCrazyMode(randomCrazy);
      setSimulationSpeed(randomSpeed);
      setTournamentType('single');
      setTournamentState(TournamentManager.getInitialState('single'));

      if (engineRef.current) {
          engineRef.current.setArenaShape(randomShape);
          engineRef.current.setObstacles(randomDensity);
          engineRef.current.setPowerZones(randomPowerZones);
          engineRef.current.setCrazyMode(randomCrazy);
          engineRef.current.setSimulationSpeed(randomSpeed);
          engineRef.current.spawn(randomCounts);
          engineRef.current.start();
      }
  }, []);

  const handleRandomTournament = useCallback(() => {
      const types: TournamentType[] = ['bo3', 'bo5', 'bo7'];
      const randomType = types[Math.floor(Math.random() * types.length)];

      handleRandomBattle(); // Generate random arena setup
      setTournamentType(randomType);
      const newState = TournamentManager.getInitialState(randomType);
      setTournamentState(newState);
      setGameState(prev => ({ ...prev, tournament: newState }));
  }, [handleRandomBattle]);

  // Detect round finish and handle tournament logic
  useEffect(() => {
      if (gameState.status === 'finished' && gameState.winner && !nextRoundTimerRef.current) {
          // Add to match history
          const summary: MatchSummary = {
              id: `match-${Date.now()}`,
              arenaShape: gameState.arenaShape,
              winner: gameState.winner,
              duration: gameState.stats.elapsedTime,
              conversions: gameState.stats.totalConversions,
              collisions: gameState.stats.totalCollisions,
              timestamp: Date.now()
          };
          setMatchHistory(prev => [summary, ...prev].slice(0, 20));

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
                  // If we are using manual features, keep them
                  const hasManual = gameState.manualObstacles.length > 0 || gameState.manualPowerZones.length > 0;
                  handleRestart(hasManual);
              }, 3000);
          } else if (autoPlay) {
              // Tournament over, start new random tournament if autoPlay is on
              nextRoundTimerRef.current = window.setTimeout(() => {
                  nextRoundTimerRef.current = null;
                  handleRandomTournament();
              }, 3000);
          }
      } else if (gameState.status === 'finished' && gameState.winner && gameState.tournament.type === 'single' && autoPlay && !nextRoundTimerRef.current) {
          // Single match over, start new random battle if autoPlay is on
          nextRoundTimerRef.current = window.setTimeout(() => {
              nextRoundTimerRef.current = null;
              handleRandomBattle();
          }, 3000);
      }
  }, [gameState.status, gameState.winner, gameState.tournament.type, tournamentState, autoPlay, handleRandomBattle, handleRandomTournament]);

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
            tournamentState={tournamentState}
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
            onRandomBattle={handleRandomBattle}
            onRandomTournament={handleRandomTournament}
            autoPlay={autoPlay}
            onAutoPlayToggle={setAutoPlay}
            onLoadPreset={handleLoadPreset}
            onSaveArena={handleSaveArena}
            onClearArena={handleClearArena}
            crazyHistory={gameState.crazyMode.history}
            onTriggerCrazyEvent={handleTriggerCrazyEvent}
          />

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
                onClick={() => handleRestart()}
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
            stats={{
                ...gameState.stats,
                counts: currentCounts
            }}
            tournament={tournamentState}
          />

          <CollapsibleSection title="Match History" defaultExpanded={false} icon="📋">
            <MatchHistory
                history={tournamentState.history}
                playerNames={playerNames}
                summaryHistory={matchHistory}
            />
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
