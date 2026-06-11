import React from 'react';
import type { TournamentState, PlayerNames } from '../types/game';
import { TournamentManager } from '../game/TournamentManager';

interface TournamentDashboardProps {
  state: TournamentState;
  playerNames: PlayerNames;
}

const TournamentDashboard: React.FC<TournamentDashboardProps> = ({ state, playerNames }) => {
  if (state.type === 'single') return null;

  const winsNeeded = TournamentManager.getWinsNeeded(state.type);
  const types = ['rock', 'paper', 'scissors'] as const;

  return (
    <div className="card tournament-dashboard" style={{ marginTop: '1rem' }}>
      <h2 className="section-title">🏆 Tournament Progress</h2>
      <div className="round-info" style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '1.2rem', color: '#94A3B8' }}>Round {state.currentRound}</span>
      </div>

      <div className="wins-progress-list">
        {types.map(type => {
          const wins = state.wins[type];
          const progress = (wins / winsNeeded) * 100;
          return (
            <div key={type} className="win-progress-item" style={{ marginBottom: '1rem' }}>
              <div className="win-progress-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{playerNames[type]}</span>
                <span>{wins} / {winsNeeded}</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '8px', background: '#111827', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  className={`progress-bar-fill ${type}`}
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    transition: 'width 0.5s ease-out'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TournamentDashboard;
