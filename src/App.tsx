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
import type { BuilderTool } from './components/ArenaBuilder';
import CollapsibleSection from './components/CollapsibleSection';
import ScoreBoard from './components/ScoreBoard';
import WinnerModal from './components/WinnerModal';
import ProgressIndicator from './components/ProgressIndicator';
import BattleFeed from './components/BattleFeed';
import MatchHistory from './components/MatchHistory';
import CrazyEventBanner from './components/CrazyEventBanner';
import HelpCenter from './components/HelpCenter';
import RpsLogo from './components/RpsLogo';
import { soundManager } from './game/SoundManager';

const ARENA_WIDTH = 1000;
const ARENA_HEIGHT = 600;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const nextRoundTimerRef = useRef<number | null>(null);
  const isRoundProcessedRef = useRef<boolean>(false);

  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [leftExpanded, setLeftExpanded] = useState<Record<string, boolean>>({
      controls: true,
      arena: false,
      adv: false,
      players: true,
      tournament: false,
      random: false,
      builder: false
  });
  const [rightExpanded, setRightExpanded] = useState<Record<string, boolean>>({
      scoreboard: true,
      stats: false,
      advStats: false,
      history: false,
      feed: false,
      help: false
  });

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
  const [unitClasses, setUnitClasses] = useState(false);
  const [advancedAI, setAdvancedAI] = useState(false);
  const [classDist, setClassDist] = useState<'normal' | 'mixed' | 'random'>('normal');
  const [aiDist, setAIDist] = useState<'random' | 'smart' | 'mixed'>('random');
  const [matchHistory, setMatchHistory] = useState<MatchSummary[]>(() => {
      const saved = localStorage.getItem('rps_match_history');
      return saved ? JSON.parse(saved) : [];
  });
  const [advancedStats, setAdvancedStats] = useState<{classStats: any, aiStats: any}>(() => {
      const saved = localStorage.getItem('rps_advanced_stats');
      return saved ? JSON.parse(saved) : {
          classStats: { speedWins: 0, tankWins: 0, berserkerWins: 0, normalWins: 0 },
          aiStats: { randomWins: 0, aggressiveWins: 0, defensiveWins: 0, hunterWins: 0, chaoticWins: 0, smartWins: 0 }
      };
  });
  const [selectedTool, setSelectedTool] = useState<BuilderTool>('wall');
  const [isEditing, setIsEditing] = useState(false);

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
    },
    unitClassesEnabled: false,
    advancedAIEnabled: false,
    classDistribution: 'normal',
    aiDistribution: 'random'
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
    return () => {
        if (engineRef.current) {
            engineRef.current.destroy();
            engineRef.current = null;
        }
    };
  }, [handleStateChange]);

  useEffect(() => {
      localStorage.setItem('rps_match_history', JSON.stringify(matchHistory.slice(0, 20)));
  }, [matchHistory]);

  useEffect(() => {
      localStorage.setItem('rps_advanced_stats', JSON.stringify(advancedStats));
  }, [advancedStats]);

  useEffect(() => {
    soundManager.setEnabled(!isMuted);
  }, [isMuted]);


  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !engineRef.current) return;

      const handleContextMenu = (e: MouseEvent) => {
          e.preventDefault();
          if (!isEditing || !engineRef.current) return;
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) * (canvas.width / rect.width);
          const y = (e.clientY - rect.top) * (canvas.height / rect.height);
          engineRef.current.removeObjectAt(x, y);
      };

      const handleMouseMove = (e: MouseEvent) => {
          if (!isEditing || !engineRef.current) return;
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) * (canvas.width / rect.width);
          const y = (e.clientY - rect.top) * (canvas.height / rect.height);
          engineRef.current.updateHover(x, y);
      };

      const handleClick = (e: MouseEvent) => {
          if (e.button !== 0) return; // Only left click
          if (!isEditing || !engineRef.current || (gameState.status !== 'idle' && gameState.status !== 'finished')) return;

          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) * (canvas.width / rect.width);
          const y = (e.clientY - rect.top) * (canvas.height / rect.height);

          if (engineRef.current.getObjectAt(x, y)) return;

          // Add selected object
          if (selectedTool === 'wall') {
              const newObs: Obstacle = {
                  id: `manual-obs-${Date.now()}`,
                  type: 'wall',
                  x, y,
                  width: 60,
                  height: 30
              };
              engineRef.current.setManualFeatures(
                  [...gameState.manualObstacles, newObs],
                  gameState.manualPowerZones
              );
          } else if (selectedTool === 'boulder') {
              const newObs: Obstacle = {
                  id: `manual-obs-${Date.now()}`,
                  type: 'boulder',
                  x, y,
                  radius: 25
              };
              engineRef.current.setManualFeatures(
                  [...gameState.manualObstacles, newObs],
                  gameState.manualPowerZones
              );
          } else {
              const zoneType = selectedTool as 'speed' | 'slow' | 'chaos';
              const newZone: PowerZone = {
                  id: `manual-zone-${Date.now()}`,
                  type: zoneType,
                  x, y,
                  radius: 50
              };
              engineRef.current.setManualFeatures(
                  gameState.manualObstacles,
                  [...gameState.manualPowerZones, newZone]
              );
          }
      };

      canvas.addEventListener('contextmenu', handleContextMenu);
      canvas.addEventListener('mousedown', handleClick);
      canvas.addEventListener('mousemove', handleMouseMove);
      return () => {
          canvas.removeEventListener('contextmenu', handleContextMenu);
          canvas.removeEventListener('mousedown', handleClick);
          canvas.removeEventListener('mousemove', handleMouseMove);
      };
  }, [gameState.status, gameState.manualObstacles, gameState.manualPowerZones, selectedTool, isEditing]);

  const handleStart = useCallback((skipFeatureGeneration: boolean = false) => {
    if (engineRef.current) {
      if (nextRoundTimerRef.current) {
          clearTimeout(nextRoundTimerRef.current);
          nextRoundTimerRef.current = null;
      }
      isRoundProcessedRef.current = false;
      engineRef.current.setArenaShape(arenaShape);
      engineRef.current.spawn(counts, skipFeatureGeneration);
      engineRef.current.start();
      setRightExpanded(prev => ({ ...prev, stats: true }));
    }
  }, [arenaShape, counts]);

  const handlePause = useCallback(() => {
    if (engineRef.current) engineRef.current.pause();
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current) engineRef.current.start();
  }, []);

  const handleReset = useCallback(() => {
    if (engineRef.current) {
      setObstacles('off');
      setPowerZones(false);
      engineRef.current.setObstacles('off');
      engineRef.current.setPowerZones(false);
      engineRef.current.setManualFeatures([], []);
      engineRef.current.reset();
      if (nextRoundTimerRef.current) {
          clearTimeout(nextRoundTimerRef.current);
          nextRoundTimerRef.current = null;
      }
    }
  }, []);

  const handleResetTournament = () => {
      const newState = TournamentManager.getInitialState(tournamentType);
      setTournamentState(newState);
      setGameState(prev => ({ ...prev, tournament: newState }));
      handleReset();
  };

  const handleRestoreDefaults = useCallback(() => {
      const defaultCounts = { rock: 10, paper: 10, scissors: 10 };
      setCounts(defaultCounts);
      setArenaShape('rectangle');
      setSimulationSpeed(1);
      setTournamentType('single');
      setTournamentState(TournamentManager.getInitialState('single'));
      setCrazyMode(false);
      setObstacles('off');
      setPowerZones(false);
      setAutoPlay(false);
      setUnitClasses(false);
      setAdvancedAI(false);
      setClassDist('normal');
      setAIDist('random');

      if (engineRef.current) {
          engineRef.current.setArenaShape('rectangle');
          engineRef.current.setSimulationSpeed(1);
          engineRef.current.setCrazyMode(false);
          engineRef.current.setObstacles('off');
          engineRef.current.setPowerZones(false);
          engineRef.current.setManualFeatures([], []);
          engineRef.current.setAdvancedSimulation(false, false, 'normal', 'random');
          engineRef.current.reset();
      }
  }, []);

  const handleRestart = useCallback((skipFeatureGeneration: boolean = false) => {
    handleReset();
    handleStart(skipFeatureGeneration);
  }, [handleReset, handleStart]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

          switch(e.code) {
              case 'Space':
                  e.preventDefault();
                  if (gameState.status === 'running') handlePause();
                  else if (gameState.status === 'paused') handleResume();
                  break;
              case 'KeyR':
                  handleRestart();
                  break;
              case 'KeyS':
                  if (gameState.status === 'idle' || gameState.status === 'finished') handleStart();
                  break;
              case 'KeyD':
                  handleRestoreDefaults();
                  break;
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, handlePause, handleResume, handleRestart, handleStart, handleRestoreDefaults]);

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

  const updateAdvancedSim = useCallback((
      u: boolean, a: boolean, c: 'normal' | 'mixed' | 'random', ai: 'random' | 'smart' | 'mixed'
  ) => {
      if (engineRef.current) {
          engineRef.current.setAdvancedSimulation(u, a, c, ai);
      }
  }, []);

  const handleClassesToggle = (val: boolean) => {
      setUnitClasses(val);
      updateAdvancedSim(val, advancedAI, classDist, aiDist);
  };

  const handleAIToggle = (val: boolean) => {
      setAdvancedAI(val);
      updateAdvancedSim(unitClasses, val, classDist, aiDist);
  };

  const handleClassDistChange = (val: any) => {
      setClassDist(val);
      updateAdvancedSim(unitClasses, advancedAI, val, aiDist);
  };

  const handleAIDistChange = (val: any) => {
      setAIDist(val);
      updateAdvancedSim(unitClasses, advancedAI, classDist, val);
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

  const handleUltimateChaos = useCallback(() => {
      const randomClassDist = Math.random() > 0.5 ? 'mixed' : 'random';
      const randomAIDist = Math.random() > 0.5 ? 'smart' : 'mixed';

      setUnitClasses(true);
      setAdvancedAI(true);
      setClassDist(randomClassDist);
      setAIDist(randomAIDist);

      handleRandomTournament();

      if (engineRef.current) {
          engineRef.current.setCrazyMode(true);
          setCrazyMode(true);
          engineRef.current.setAdvancedSimulation(true, true, randomClassDist, randomAIDist);
      }
  }, [handleRandomTournament]);

  // Detect round finish and handle tournament logic
  useEffect(() => {
      if (gameState.status === 'finished' && gameState.winner && !isRoundProcessedRef.current) {
          isRoundProcessedRef.current = true;

          const advInfo = engineRef.current?.getWinnerAdvancedInfo();

          // Add to match history
          const summary: MatchSummary = {
              id: `match-${Date.now()}`,
              arenaShape: gameState.arenaShape,
              winner: gameState.winner,
              duration: gameState.stats.elapsedTime,
              conversions: gameState.stats.totalConversions,
              collisions: gameState.stats.totalCollisions,
              timestamp: Date.now(),
              classWinner: advInfo?.class,
              aiWinner: advInfo?.ai
          };
          setMatchHistory(prev => [summary, ...prev].slice(0, 20));

          if (advInfo) {
              setAdvancedStats(prev => {
                  const newClass = { ...prev.classStats };
                  const newAI = { ...prev.aiStats };
                  if (advInfo.class === 'speed') newClass.speedWins++;
                  if (advInfo.class === 'tank') newClass.tankWins++;
                  if (advInfo.class === 'berserker') newClass.berserkerWins++;
                  if (advInfo.class === 'normal') newClass.normalWins++;

                  if (advInfo.ai === 'random') newAI.randomWins++;
                  if (advInfo.ai === 'aggressive') newAI.aggressiveWins++;
                  if (advInfo.ai === 'defensive') newAI.defensiveWins++;
                  if (advInfo.ai === 'hunter') newAI.hunterWins++;
                  if (advInfo.ai === 'chaotic') newAI.chaoticWins++;
                  if (advInfo.ai === 'smart') newAI.smartWins++;

                  return { classStats: newClass, aiStats: newAI };
              });
          }

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
        <h1>
          <RpsLogo size={32} />
          RPS ARENA ROYALE
        </h1>
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

          <div className="sidebar-top-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setLeftExpanded(Object.keys(leftExpanded).reduce((acc, k) => ({...acc, [k]: false}), {}))}
              >
                  ⬆ Collapse All
              </button>
              <button className="btn btn-secondary" onClick={handleRestoreDefaults}>
                  🔄 Restore Defaults
              </button>
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
            onUltimateChaos={handleUltimateChaos}
            autoPlay={autoPlay}
            onAutoPlayToggle={setAutoPlay}
            onLoadPreset={handleLoadPreset}
            onSaveArena={handleSaveArena}
            onClearArena={handleClearArena}
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            isEditing={isEditing}
            onEditingToggle={setIsEditing}
            crazyHistory={gameState.crazyMode.history}
            unitClassesEnabled={unitClasses}
            advancedAIEnabled={advancedAI}
            classDist={classDist}
            aiDist={aiDist}
            onClassesToggle={handleClassesToggle}
            onAIToggle={handleAIToggle}
            onClassDistChange={handleClassDistChange}
            onAIDistChange={handleAIDistChange}
            onTriggerCrazyEvent={handleTriggerCrazyEvent}
            expandedStates={leftExpanded}
            onToggleSection={(key, val) => setLeftExpanded(prev => ({...prev, [key]: val}))}
          />

          <div className="card mute-card">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`btn mute-btn ${isMuted ? 'muted' : 'unmuted'}`}
              >
                <span className="mute-icon">{isMuted ? '🔇' : '🔊'}</span>
                <span className="mute-text">Sound: {isMuted ? 'OFF' : 'ON'}</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h2 className="section-title arena-title">⚔ Battle Arena: {capitalize(arenaShape)}</h2>
                <div className="active-badges" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {advancedAI && <span className="badge-status ai">🧠 AI ON</span>}
                    {unitClasses && <span className="badge-status classes">🛡 CLASSES ON</span>}
                    {crazyMode && <span className="badge-status crazy">🎭 CRAZY ON</span>}
                    {obstacles !== 'off' && <span className="badge-status obs">🧱 OBSTACLES: {obstacles.toUpperCase()}</span>}
                    {powerZones && <span className="badge-status zones">⚡ ZONES ON</span>}
                    {(gameState.manualObstacles.length > 0 || gameState.manualPowerZones.length > 0) && <span className="badge-status custom">🏗 CUSTOM ARENA</span>}
                </div>
            </div>
            <div className="stat-badge arena-stat-badge">
              Total Entities: <strong>{totalEntities}</strong>
            </div>
          </div>
          <div className="arena-container">
            <div className={`empty-arena-overlay ${gameState.status === 'idle' && !leftExpanded.builder ? 'visible' : ''}`}>
              <div className="empty-message">
                <div className="original-icon" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎮</div>
                <h2>Ready To Battle</h2>
                <p>
                  Configure your simulation,<br/>
                  choose your settings,<br/>
                  and press <strong>Start Battle</strong>.
                </p>
              </div>
            </div>
            <canvas
              ref={canvasRef}
              width={ARENA_WIDTH}
              height={ARENA_HEIGHT}
            />
          </div>

          <div className="card progress-card">
              <ProgressIndicator counts={currentCounts} status={gameState.status} />
          </div>
        </section>

        <aside className={`scoreboard-column ${showRightDrawer ? 'mobile-visible' : ''}`}>
          <div className="drawer-header">
            <h3>Live Stats</h3>
            <button className="close-drawer" onClick={() => setShowRightDrawer(false)}>×</button>
          </div>

          <div className="sidebar-top-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setRightExpanded(Object.keys(rightExpanded).reduce((acc, k) => ({...acc, [k]: false}), {}))}
              >
                  ⬆ Collapse All
              </button>
          </div>

          <ScoreBoard
            playerNames={playerNames}
            expandedStates={rightExpanded}
            onToggleSection={(key, val) => setRightExpanded(prev => ({...prev, [key]: val}))}
            status={gameState.status}
            stats={{
                ...gameState.stats,
                counts: currentCounts,
                advanced: advancedStats
            }}
            tournament={tournamentState}
          />

          <CollapsibleSection
            title="Match History"
            expanded={rightExpanded.history}
            onToggle={(v) => setRightExpanded(p => ({...p, history: v}))}
            icon="📋"
          >
            <MatchHistory
                history={tournamentState.history}
                playerNames={playerNames}
                summaryHistory={matchHistory}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Battle Feed"
            expanded={rightExpanded.feed}
            onToggle={(v) => setRightExpanded(p => ({...p, feed: v}))}
            icon="⚡"
          >
            <BattleFeed events={gameState.events} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Help & Guide"
            expanded={rightExpanded.help}
            onToggle={(v) => setRightExpanded(p => ({...p, help: v}))}
            icon="❓"
          >
            <HelpCenter />
          </CollapsibleSection>

          <footer className="sidebar-footer">
            <div className="footer-item">
              <span className="footer-label">GitHub Repository</span>
              <a
                href="https://github.com/karalapatiphanicharan-cyber/rps-arena-simulator"
                target="_blank"
                rel="noopener noreferrer"
                className="github-btn"
                aria-label="View project on GitHub"
              >
                <svg className="github-icon" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View Repository
              </a>
            </div>
            <div className="footer-item">
              <span className="footer-label">Done by</span>
              <span className="author-name">Phani Charan</span>
            </div>
          </footer>
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
