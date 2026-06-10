import React from 'react';
import type { EntityType, GameCounts, PlayerNames } from '../types/game';
import { getEmoji } from '../game/Rules';

interface WinnerModalProps {
  winner: EntityType | null;
  counts: GameCounts;
  playerNames: PlayerNames;
  onRestart: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, counts, playerNames, onRestart }) => {
  if (!winner) return null;

  const totalEntities = counts.rock + counts.paper + counts.scissors;
  const winnerName = playerNames[winner];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1>🏆 {winnerName.toUpperCase()} WINS!</h1>
        <div className="winner-emoji">{getEmoji(winner)}</div>
        <p>Total Entities: {totalEntities}</p>
        <button onClick={onRestart} className="restart-btn">
          Restart Battle
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;
