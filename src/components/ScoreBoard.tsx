import React from 'react';
import type { GameCounts, PlayerNames, EntityType } from '../types/game';
import { getEmoji } from '../game/Rules';

interface ScoreBoardProps {
  counts: GameCounts;
  playerNames: PlayerNames;
  elapsedTime: number;
  totalEntities: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ counts, playerNames, elapsedTime, totalEntities }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLeader = (): string => {
    const types: EntityType[] = ['rock', 'paper', 'scissors'];
    let max = -1;
    let leader = 'None';

    types.forEach(type => {
      if (counts[type] > max) {
        max = counts[type];
        leader = playerNames[type];
      } else if (counts[type] === max && max > 0) {
        leader = 'Tie';
      }
    });

    if (max === 0) return 'None';
    return leader;
  };

  return (
    <div className="scoreboard-container">
      <div className="card scoreboard">
        <h2 className="section-title">📊 Live Scoreboard</h2>
        <div className="score-cards">
          <div className="score-card rock">
            <div className="info">
              <span className="emoji">{getEmoji('rock')}</span>
              <span className="name">{playerNames.rock}</span>
            </div>
            <span className="count">{counts.rock}</span>
          </div>
          <div className="score-card paper">
            <div className="info">
              <span className="emoji">{getEmoji('paper')}</span>
              <span className="name">{playerNames.paper}</span>
            </div>
            <span className="count">{counts.paper}</span>
          </div>
          <div className="score-card scissors">
            <div className="info">
              <span className="emoji">{getEmoji('scissors')}</span>
              <span className="name">{playerNames.scissors}</span>
            </div>
            <span className="count">{counts.scissors}</span>
          </div>
        </div>
      </div>

      <div className="card stats-card">
        <h2 className="section-title">📈 Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Entities</span>
            <span className="stat-value">{totalEntities}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Elapsed Time</span>
            <span className="stat-value">{formatTime(elapsedTime)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Current Leader</span>
            <span className="stat-value">{getLeader()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
