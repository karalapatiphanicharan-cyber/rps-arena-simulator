import React from 'react';
import type { EntityType, GameCounts, PlayerNames } from '../types/game';
import { getEmoji } from '../game/Rules';

interface WinnerModalProps {
  winner: EntityType | null;
  counts: GameCounts;
  playerNames: PlayerNames;
  elapsedTime: number;
  onRestart: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, counts, playerNames, elapsedTime, onRestart }) => {
  if (!winner) return null;

  const totalEntities = counts.rock + counts.paper + counts.scissors;
  const winnerName = playerNames[winner];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1 className="winner-title">🏆 {winnerName.toUpperCase()} WINS!</h1>
        <div className="winner-display">{getEmoji(winner)}</div>

        <div className="winner-stats">
          <div className="stat-item">
            <span className="stat-label">Final Count</span>
            <span className="stat-value">{totalEntities} {winnerName}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Battle Duration</span>
            <span className="stat-value">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <button onClick={onRestart} className="btn btn-start btn-large">
          Play Again
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;
