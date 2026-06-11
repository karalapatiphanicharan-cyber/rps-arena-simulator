import React, { useEffect } from 'react';
import type { EntityType, GameCounts, PlayerNames, GameStats } from '../types/game';
import { getEmoji } from '../game/Rules';
import confetti from 'canvas-confetti';

interface WinnerModalProps {
  winner: EntityType | null;
  counts: GameCounts;
  playerNames: PlayerNames;
  stats: GameStats;
  onRestart: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, counts, playerNames, stats, onRestart }) => {
  useEffect(() => {
    if (winner) {
      const duration = 3 * 1000;
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

  const winnerName = playerNames[winner];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ position: 'relative', zIndex: 100 }}>
        <h1 className="winner-title">🏆 {winnerName.toUpperCase()} WINS!</h1>
        <div className="winner-display" style={{ animation: 'bounce 1s infinite' }}>{getEmoji(winner)}</div>

        <div className="winner-stats">
          <div className="stat-item">
            <span className="stat-label">Winner Type</span>
            <span className="stat-value">{winnerName}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Final Count</span>
            <span className="stat-value">{counts[winner]} {winnerName}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Battle Duration</span>
            <span className="stat-value">{formatTime(stats.elapsedTime)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Arena Shape</span>
            <span className="stat-value">{capitalize(stats.arenaShape)}</span>
          </div>
        </div>

        <button onClick={onRestart} className="btn btn-start btn-large">
          Play Again
        </button>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default WinnerModal;
