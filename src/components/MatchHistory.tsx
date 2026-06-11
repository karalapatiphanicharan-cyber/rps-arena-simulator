import React from 'react';
import type { MatchResult, PlayerNames, MatchSummary } from '../types/game';

interface MatchHistoryProps {
  history: MatchResult[];
  playerNames: PlayerNames;
  summaryHistory: MatchSummary[];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ history, playerNames, summaryHistory }) => {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="match-history">
      {history.length > 0 && (
          <div className="current-tournament-history" style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.5rem' }}>Current Tournament</h4>
              <div className="stats-grid">
                {history.map((match, index) => (
                  <div key={index} className="stat-item" style={{ padding: '0.4rem 0', borderBottom: '1px solid #374151' }}>
                    <span className="stat-label">Round {match.round}</span>
                    <span className="stat-value" style={{ color: match.winner === 'rock' ? '#EF4444' : (match.winner === 'paper' ? '#3B82F6' : '#FACC15') }}>
                      {playerNames[match.winner]} ({match.duration.toFixed(1)}s)
                    </span>
                  </div>
                ))}
              </div>
          </div>
      )}

      <h4 style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.5rem' }}>Recent Matches</h4>
      {summaryHistory.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center' }}>No matches recorded yet.</p>
      ) : (
        <div className="stats-grid">
          {summaryHistory.map((match) => (
            <div key={match.id} className="stat-item" style={{ padding: '0.5rem 0', borderBottom: '1px solid #374151', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.2rem' }}>
                <span className="stat-value" style={{ color: match.winner === 'rock' ? '#EF4444' : (match.winner === 'paper' ? '#3B82F6' : '#FACC15') }}>
                  {playerNames[match.winner]} Won
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{new Date(match.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                {capitalize(match.arenaShape)} • {match.duration.toFixed(1)}s • {match.conversions} conv.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
