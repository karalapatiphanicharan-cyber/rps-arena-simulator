import React from 'react';
import type { GameCounts, PlayerNames } from '../types/game';
import { getEmoji } from '../game/Rules';

interface ScoreBoardProps {
  counts: GameCounts;
  playerNames: PlayerNames;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ counts, playerNames }) => {
  return (
    <div className="scoreboard">
      <h2>Live Scoreboard</h2>
      <div className="score-item rock">
        <span className="emoji">{getEmoji('rock')}</span>
        <span className="name">{playerNames.rock}:</span>
        <span className="count">{counts.rock}</span>
      </div>
      <div className="score-item paper">
        <span className="emoji">{getEmoji('paper')}</span>
        <span className="name">{playerNames.paper}:</span>
        <span className="count">{counts.paper}</span>
      </div>
      <div className="score-item scissors">
        <span className="emoji">{getEmoji('scissors')}</span>
        <span className="name">{playerNames.scissors}:</span>
        <span className="count">{counts.scissors}</span>
      </div>
    </div>
  );
};

export default ScoreBoard;
