import React from 'react';
import type { CrazyEventName } from '../types/game';

interface DevPanelProps {
  onTriggerEvent: (name: CrazyEventName) => void;
  enabled: boolean;
}

const DevPanel: React.FC<DevPanelProps> = ({ onTriggerEvent, enabled }) => {
  if (!enabled) return null;

  const events: CrazyEventName[] = [
    'Speed Boost',
    'Freeze Wave',
    'Double Population',
    'Meteor Strike',
    'Reverse Rules',
    'Giant Entity',
    'Chaos Storm'
  ];

  return (
    <div className="card dev-panel" style={{ marginTop: '1rem', border: '2px dashed #EF4444' }}>
      <h2 className="section-title" style={{ color: '#EF4444' }}>🛠 Developer Test Panel</h2>
      <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1rem' }}>
        Manually trigger events for testing. Only works when Crazy Mode is ON.
      </p>
      <div className="button-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {events.map(name => (
          <button
            key={name}
            onClick={() => onTriggerEvent(name)}
            className="btn"
            style={{ fontSize: '0.7rem', padding: '0.5rem', background: '#374151' }}
          >
            Trigger {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DevPanel;
