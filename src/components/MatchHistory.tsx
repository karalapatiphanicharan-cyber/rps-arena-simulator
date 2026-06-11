import React from 'react';
import type { MatchResult, PlayerNames } from '../types/game';
import { getEmoji } from '../game/Rules';

interface MatchHistoryProps {
  history: MatchResult[];
  playerNames: PlayerNames;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ history, playerNames }) => {
  if (history.length === 0) return null;

  return (
    <div className="card match-history" style={{ marginTop: '1rem' }}>
      <h2 className="section-title">📜 Match History</h2>
      <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {history.map((match, index) => (
          <div key={index} className="history-item" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem',
            background: '#111827',
            borderRadius: '0.5rem',
            borderLeft: `4px solid var(--${match.winner}-color)`
          }}>
            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Round {match.round}</span>
            <span style={{ fontWeight: '600' }}>
              {getEmoji(match.winner)} {playerNames[match.winner]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchHistory;
