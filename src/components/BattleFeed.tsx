import React from 'react';
import type { BattleEvent, EntityType } from '../types/game';
import { getEmoji } from '../game/Rules';

interface BattleFeedProps {
  events: BattleEvent[];
}

const BattleFeed: React.FC<BattleFeedProps> = ({ events }) => {
  const getColor = (type: EntityType) => {
    switch(type) {
      case 'rock': return '#EF4444';
      case 'paper': return '#3B82F6';
      case 'scissors': return '#FACC15';
      default: return '#FFFFFF';
    }
  };

  return (
    <div className="card battle-feed">
      <h3 className="section-title" style={{ fontSize: '1rem' }}>⚔️ Battle Feed</h3>
      <div className="feed-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {events.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Waiting for action...</p>}
        {events.map((event) => (
          <div
            key={event.id}
            className="feed-item"
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem',
              background: '#111827',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'slideIn 0.2s ease-out'
            }}
          >
            <span style={{ color: getColor(event.winner) }}>{getEmoji(event.winner)}</span>
            <span>converted</span>
            <span style={{ color: getColor(event.loser) }}>{getEmoji(event.loser)}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default BattleFeed;
