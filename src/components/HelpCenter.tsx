import React from 'react';

const HelpCenter: React.FC = () => {
  return (
    <div className="help-center" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: '#F9FAFB', borderBottom: '1px solid #374151', paddingBottom: '0.25rem' }}>Basic Rules</h4>
        <p>Rock beats Scissors 🪨 &gt; ✂️</p>
        <p>Scissors beats Paper ✂️ &gt; 📄</p>
        <p>Paper beats Rock 📄 &gt; 🪨</p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: '#F9FAFB', borderBottom: '1px solid #374151', paddingBottom: '0.25rem' }}>Arena Shapes</h4>
        <p>Five shapes change the physics and bounce behavior: Rectangle, Square, Circle, Triangle, Hexagon.</p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: '#F9FAFB', borderBottom: '1px solid #374151', paddingBottom: '0.25rem' }}>Crazy Mode</h4>
        <p><strong>Meteor:</strong> Instant elimination area.</p>
        <p><strong>Freeze:</strong> Temporarily stops units.</p>
        <p><strong>Reverse:</strong> RPS rules flip!</p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: '#F9FAFB', borderBottom: '1px solid #374151', paddingBottom: '0.25rem' }}>Power Zones</h4>
        <p><span style={{ color: '#FACC15' }}>Yellow (Speed):</span> Faster units.</p>
        <p><span style={{ color: '#3B82F6' }}>Blue (Slow):</span> Slower units.</p>
        <p><span style={{ color: '#A855F7' }}>Purple (Chaos):</span> Random direction.</p>
      </section>

      <section>
        <h4 style={{ color: '#F9FAFB', borderBottom: '1px solid #374151', paddingBottom: '0.25rem' }}>Unit Classes</h4>
        <p>⚡ <strong>Speed:</strong> Fast, small, fragile.</p>
        <p>🛡 <strong>Tank:</strong> Slow, large, heavy.</p>
        <p>🔥 <strong>Berserker:</strong> Aggressive hunter.</p>
      </section>
    </div>
  );
};

export default HelpCenter;
