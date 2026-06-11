import React from 'react';
import type { CrazyEventName } from '../types/game';

interface CrazyEventHistoryProps {
  history: CrazyEventName[];
}

const CrazyEventHistory: React.FC<CrazyEventHistoryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="card crazy-history" style={{ marginTop: '1rem' }}>
      <h2 className="section-title">🎭 Recent Events</h2>
      <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {history.map((name, index) => (
          <div key={index} className="history-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: '#111827',
            borderRadius: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <span className="event-dot" style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getEventColor(name)
            }} />
            <span style={{ fontWeight: '600' }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const getEventColor = (name: CrazyEventName): string => {
    switch (name) {
        case 'Speed Boost': return '#FACC15';
        case 'Freeze Wave': return '#3B82F6';
        case 'Double Population': return '#10B981';
        case 'Meteor Strike': return '#EF4444';
        case 'Reverse Rules': return '#A855F7';
        case 'Giant Entity': return '#F97316';
        case 'Chaos Storm': return '#94A3B8';
        default: return '#FFFFFF';
    }
};

export default CrazyEventHistory;
