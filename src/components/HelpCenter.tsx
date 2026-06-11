import React, { useState } from 'react';

const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchHelp] = useState('');

  const sections = [
    {
      title: 'Basic Rules',
      content: [
        'Rock beats Scissors 🪨 > ✂️',
        'Scissors beats Paper ✂️ > 📄',
        'Paper beats Rock 📄 > 🪨'
      ],
      keywords: ['rules', 'rock', 'paper', 'scissors', 'beats']
    },
    {
      title: 'Arena Shapes',
      content: [
        'Rectangle, Square, Circle, Triangle, Hexagon.',
        'Shapes change movement and bounce behavior.'
      ],
      keywords: ['shapes', 'circle', 'triangle', 'hexagon', 'square', 'movement']
    },
    {
        title: 'Keyboard Shortcuts',
        content: [
          'Space: Pause/Resume',
          'R: Restart Round',
          'S: Start Battle',
          'D: Restore Defaults'
        ],
        keywords: ['shortcuts', 'keyboard', 'space', 'restart', 'start', 'defaults']
    },
    {
      title: 'Crazy Mode',
      content: [
        'Meteor: Instant elimination area.',
        'Freeze: Temporarily stops units.',
        'Reverse: RPS rules flip!'
      ],
      keywords: ['crazy', 'meteor', 'freeze', 'reverse', 'mode']
    },
    {
      title: 'Power Zones',
      content: [
        'Yellow (Speed): Faster units.',
        'Blue (Slow): Slower units.',
        'Purple (Chaos): Random direction.'
      ],
      keywords: ['zones', 'speed', 'slow', 'chaos', 'power']
    },
    {
      title: 'Unit Classes',
      content: [
        '⚡ Speed: Fast, small.',
        '🛡 Tank: Slow, large.',
        '🔥 Berserker: Aggressive hunter.'
      ],
      keywords: ['classes', 'speed', 'tank', 'berserker', 'unit']
    },
    {
        title: 'Advanced AI',
        content: [
            'Aggressive: Chases prey.',
            'Defensive: Flees predators.',
            'Hunter: Constant pursuit.',
            'Smart: Mix of all.'
        ],
        keywords: ['ai', 'aggressive', 'defensive', 'hunter', 'smart', 'advanced']
    }
  ];

  const filtered = sections.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.keywords.some(k => k.includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="help-center" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
      <div className="input-group" style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search Help..."
            value={searchTerm}
            onChange={(e) => setSearchHelp(e.target.value)}
            style={{ width: '100%', fontSize: '0.75rem' }}
          />
      </div>

      {filtered.map(s => (
        <section key={s.title} style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#F9FAFB', borderBottom: '1px solid #374151', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>{s.title}</h4>
          {s.content.map((line, i) => <p key={i} style={{ margin: '0.25rem 0' }}>{line}</p>)}
        </section>
      ))}

      {filtered.length === 0 && <p>No results found.</p>}
    </div>
  );
};

export default HelpCenter;
