import React, { useEffect, useState } from 'react';
import type { EntityType, GameCounts, PlayerNames, GameStats, TournamentState } from '../types/game';
import confetti from 'canvas-confetti';
import TypeIcon from './TypeIcon';

interface WinnerModalProps {
  winner: EntityType | null;
  counts: GameCounts;
  playerNames: PlayerNames;
  stats: GameStats;
  tournament: TournamentState;
  onRestart: () => void;
  onResetTournament: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({
    winner, counts, playerNames, stats, tournament, onRestart, onResetTournament
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (winner && !tournament.champion && tournament.type !== 'single') {
        setCountdown(3);
        const timer = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [winner, tournament.champion, tournament.type]);

  useEffect(() => {
    if (winner) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [winner]);

  if (!winner) return null;

  const isChampion = !!tournament.champion;
  const winnerName = playerNames[winner];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`modal-overlay ${isChampion ? 'champ-overlay' : ''}`}>
      <div className="modal-content" style={{ position: 'relative', zIndex: 100 }}>
        {isChampion ? (
            <h1 className="winner-title champ-title">🏆 {winnerName.toUpperCase()} IS THE CHAMPION!</h1>
        ) : (
            <h1 className="winner-title">{winnerName.toUpperCase()} WINS ROUND {tournament.history.length}!</h1>
        )}

        <div className="winner-display" style={{
          animation: 'bounce 1s infinite',
          margin: '2.5rem 0',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
            {isChampion && <div className="champion-glow" />}
            <TypeIcon type={winner} size={120} />
        </div>

        <div className="winner-stats" style={{ gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
          {isChampion ? (
              <>
                <div className="stat-item">
                    <span className="stat-label">Champion</span>
                    <span className="stat-value">{winnerName}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Tournament Type</span>
                    <span className="stat-value">{tournament.type.toUpperCase()}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Total Rounds</span>
                    <span className="stat-value">{tournament.stats.totalRounds}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Avg Round Time</span>
                    <span className="stat-value">{formatTime(tournament.stats.averageRoundTime)}</span>
                </div>
              </>
          ) : (
              <>
                <div className="stat-item">
                    <span className="stat-label">Winner Type</span>
                    <span className="stat-value">{winnerName}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Final Count</span>
                    <span className="stat-value">{counts[winner]} {winnerName}{winnerName.toLowerCase() === 'scissors' ? '' : 's'}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Battle Duration</span>
                    <span className="stat-value">{formatTime(stats.elapsedTime)}</span>
                </div>
                {tournament.type !== 'single' && (
                    <div className="next-round-indicator" style={{ marginTop: '1rem', color: '#10B981', fontWeight: '700' }}>
                        Next Round in {countdown}...
                    </div>
                )}
              </>
          )}
        </div>

        {isChampion ? (
            <button onClick={onResetTournament} className="btn btn-start btn-large">
                Restart Tournament
            </button>
        ) : (
            <button onClick={onRestart} className="btn btn-start btn-large">
                {tournament.type === 'single' ? 'Play Again' : 'Next Round Now'}
            </button>
        )}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .champ-title {
            color: #FACC15;
            text-shadow: 0 0 20px rgba(250, 204, 21, 0.5);
            letter-spacing: 0.05em;
        }
        .champion-glow {
            position: absolute;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, rgba(250, 204, 21, 0) 70%);
            border-radius: 50%;
            z-index: -1;
            animation: pulse-glow 2s infinite ease-in-out;
        }
        @keyframes pulse-glow {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
        }
        .champ-overlay {
            background: radial-gradient(circle, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
            animation: burst-bg 1s ease-out forwards;
        }
        @keyframes burst-bg {
            0% { backdrop-filter: blur(0px); }
            100% { backdrop-filter: blur(4px); }
        }
      `}</style>
    </div>
  );
};

export default WinnerModal;
