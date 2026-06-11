import React from 'react';
import type { GameCounts } from '../types/game';

interface ProgressBarProps {
  counts: GameCounts;
}

const ProgressIndicator: React.FC<ProgressBarProps> = ({ counts }) => {
  const total = counts.rock + counts.paper + counts.scissors;

  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return (count / total) * 100;
  };

  const rockPerc = getPercentage(counts.rock);
  const paperPerc = getPercentage(counts.paper);
  const scissorsPerc = getPercentage(counts.scissors);

  return (
    <div className="domination-progress" style={{ margin: '1rem 0' }}>
      <h3 style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '0.5rem' }}>Domination Progress</h3>
      <div className="progress-container" style={{ height: '12px', background: '#111827', borderRadius: '6px', display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: `${rockPerc}%`, background: '#EF4444', transition: 'width 0.3s ease' }} />
        <div style={{ width: `${paperPerc}%`, background: '#3B82F6', transition: 'width 0.3s ease' }} />
        <div style={{ width: `${scissorsPerc}%`, background: '#FACC15', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem' }}>
        <span style={{ color: '#EF4444' }}>{Math.round(rockPerc)}%</span>
        <span style={{ color: '#3B82F6' }}>{Math.round(paperPerc)}%</span>
        <span style={{ color: '#FACC15' }}>{Math.round(scissorsPerc)}%</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
