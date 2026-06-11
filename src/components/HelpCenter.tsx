import React, { useState } from 'react';

const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchHelp] = useState('');

  const sections = [
    {
      title: 'Basic Rules',
      content: [
        'What it does: Defines the core conversion mechanics of the game.',
        'How it works: When two entities collide, their types are compared. If one type beats the other, the loser is converted to the winner\'s type.',
        'Example: A Rock 🪨 collides with Scissors ✂️.',
        'Expected Result: Scissors becomes Rock 🪨.',
        '',
        '• Rock 🪨 beats Scissors ✂️',
        '• Scissors ✂️ beats Paper 📄',
        '• Paper 📄 beats Rock 🪨'
      ],
      keywords: ['rules', 'rock', 'paper', 'scissors', 'beats']
    },
    {
      title: 'Arena Shapes',
      content: [
        'What it does: Changes the boundaries of the battle arena.',
        'How it works: Each shape (Rectangle, Square, Circle, Triangle, Hexagon) has unique boundary logic that affects how entities bounce and cluster.',
        'Example: Switching to Circle shape.',
        'Expected Result: Entities move in a circular boundary, often clustering towards the center.',
        '',
        '• Rectangle/Square: Standard 4-wall bounce.',
        '• Circle: Smooth continuous curvature.',
        '• Triangle/Hexagon: Sharp angles create chaotic bounce patterns.'
      ],
      keywords: ['shapes', 'circle', 'triangle', 'hexagon', 'square', 'movement']
    },
    {
      title: 'Tournament Mode',
      content: [
        'What it does: Organizes battles into a series of rounds.',
        'How it works: Tracks wins across matches (Best of 3, 5, or 7). The first type to reach the required wins is crowned Champion.',
        'Example: Best of 3 (BO3) requires 2 wins.',
        'Expected Result: Persistent score tracking across rounds until a winner is found.'
      ],
      keywords: ['tournament', 'series', 'bo3', 'bo5', 'bo7', 'wins']
    },
    {
      title: 'Crazy Mode Events',
      content: [
        'What it does: Triggers random chaotic events during battle.',
        'How it works: Every 8-15 seconds, a random event is selected and activated.',
        '',
        '• Speed Boost ⚡: All units gain 2x speed for 5 seconds.',
        '• Freeze Wave ❄️: All units stop moving for 3 seconds.',
        '• Meteor Strike ☄️: High-damage zone appears; units caught are eliminated.',
        '• Reverse Rules 🔄: RPS rules flip (e.g., Scissors beats Rock) for 10 seconds.',
        '• Giant Entity 🦍: One unit grows 3x in size and gains massive mass.',
        '• Chaos Storm 🌀: Units are flung in random directions.',
        '• Double Population 👥: Every unit clones itself once.'
      ],
      keywords: ['crazy', 'meteor', 'freeze', 'reverse', 'mode', 'events']
    },
    {
      title: 'Obstacles',
      content: [
        'What it does: Places static physical barriers in the arena.',
        'How it works: Walls and Boulders act as solid objects. Entities bounce off them using elastic collision physics.',
        'Example: A unit hits a Boulder.',
        'Expected Result: The unit bounces back, losing some momentum depending on the angle.'
      ],
      keywords: ['obstacles', 'walls', 'boulders', 'collisions']
    },
    {
      title: 'Power Zones',
      content: [
        'What it does: Modifies unit behavior when they enter specific areas.',
        '',
        '• Speed Zone (Yellow) 🟡: Units gain a permanent speed boost while inside.',
        '• Slow Zone (Blue) 🔵: Units move at 50% speed while inside.',
        '• Chaos Zone (Purple) 🟣: Units change to a random direction every 10 frames.',
        '',
        'Expected Result: Tactical areas that can be used to outmaneuver or trap opponents.'
      ],
      keywords: ['zones', 'speed', 'slow', 'chaos', 'power']
    },
    {
      title: 'Arena Builder',
      content: [
        'What it does: Allows custom arena design.',
        'How it works: Select a tool (Wall, Boulder, Zone) and click the arena to place. Right-click any object to remove it.',
        'Example: Placing a Slow Zone in the center.',
        'Expected Result: Custom tactical layouts that can be saved and loaded.'
      ],
      keywords: ['builder', 'custom', 'placement', 'save', 'load']
    },
    {
      title: 'Advanced Simulation',
      content: [
        'What it does: Adds complex behavior and stats to units.',
        '',
        '• Unit Classes: Units gain unique stats (Speed: Fast/Small, Tank: Slow/Large, Berserker: Aggressive/Massive).',
        '• Advanced AI: Units use vector math to hunt prey and flee from predators instead of moving randomly.',
        'Example: A Tank Rock chasing a Speed Scissors.',
        'Expected Result: Higher-tier strategic simulation with specialized unit roles.'
      ],
      keywords: ['classes', 'ai', 'aggressive', 'defensive', 'hunter', 'smart', 'advanced']
    },
    {
      title: 'Random & Chaos Modes',
      content: [
        '• Random Battle: Generates a random set of units, shapes, and settings.',
        '• Auto Play: Automatically starts a new random battle after the current one finishes.',
        '• Ultimate Chaos Mode: Enables EVERYTHING—Crazy Mode, AI, Classes, Max Speed, and Random setup in one click.',
        'Expected Result: Unpredictable and high-energy spectator matches.'
      ],
      keywords: ['random', 'chaos', 'autoplay', 'ultimate']
    },
    {
        title: 'Keyboard Shortcuts',
        content: [
          '• Space: Pause / Resume simulation.',
          '• R: Restart the current round.',
          '• S: Start a brand new battle.',
          '• D: Restore all settings to Factory Defaults.'
        ],
        keywords: ['shortcuts', 'keyboard', 'space', 'restart', 'start', 'defaults']
    }
  ];

  const filtered = sections.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.keywords.some(k => k.includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="help-center" style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
      <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchHelp(e.target.value)}
            style={{
                width: '100%',
                fontSize: '0.8rem',
                padding: '0.6rem 1rem',
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: 'white'
            }}
          />
      </div>

      <div className="help-sections-container" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {filtered.map(s => (
            <section key={s.title} style={{ marginBottom: '2rem' }}>
            <h4 style={{
                color: '#F9FAFB',
                borderBottom: '2px solid #374151',
                paddingBottom: '0.4rem',
                marginBottom: '0.8rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                {s.title}
            </h4>
            {s.content.map((line, i) => (
                <p key={i} style={{
                    margin: line === '' ? '0.5rem 0' : '0.35rem 0',
                    lineHeight: '1.4',
                    color: line.startsWith('•') ? '#F1F5F9' : '#94A3B8',
                    fontWeight: line.startsWith('•') ? '600' : '400'
                }}>
                    {line}
                </p>
            ))}
            </section>
        ))}

        {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p>No results found for "{searchTerm}"</p>
            </div>
        )}
      </div>

      <footer className="help-footer" style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #374151',
          textAlign: 'center'
      }}>
          <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>DESIGNED & DEVELOPED BY</p>
          <h2 style={{
              color: '#3B82F6',
              fontSize: '1.8rem',
              fontWeight: '900',
              margin: '0.5rem 0',
              letterSpacing: '0.1em'
          }}>
              KSPC
          </h2>
          <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '500' }}>
              RPS Arena Royale © 2026
          </p>
      </footer>
    </div>
  );
};

export default HelpCenter;
