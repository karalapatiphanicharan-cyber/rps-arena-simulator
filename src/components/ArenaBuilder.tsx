import { useState, useEffect } from 'react';
import type { ArenaPreset, ArenaShape } from '../types/game';

interface ArenaBuilderProps {
    onLoadPreset: (preset: ArenaPreset) => void;
    onSaveArena: (name: string) => void;
    onClearArena: () => void;
    currentShape: ArenaShape;
    onShapeChange: (shape: ArenaShape) => void;
}

const PRESETS: ArenaPreset[] = [
    {
        name: 'Maze',
        shape: 'rectangle',
        obstacles: [
            { id: 'maze-1', type: 'wall', x: 300, y: 150, width: 20, height: 300 },
            { id: 'maze-2', type: 'wall', x: 700, y: 450, width: 20, height: 300 },
            { id: 'maze-3', type: 'wall', x: 500, y: 300, width: 400, height: 20 },
        ],
        powerZones: []
    },
    {
        name: 'Chaos',
        shape: 'circle',
        obstacles: [],
        powerZones: [
            { id: 'chaos-1', type: 'chaos', x: 300, y: 300, radius: 100 },
            { id: 'chaos-2', type: 'chaos', x: 700, y: 300, radius: 100 },
        ]
    },
    {
        name: 'Speed Circuit',
        shape: 'hexagon',
        obstacles: [
            { id: 'speed-1', type: 'boulder', x: 500, y: 300, radius: 60 }
        ],
        powerZones: [
            { id: 'speed-z1', type: 'speed', x: 250, y: 300, radius: 80 },
            { id: 'speed-z2', type: 'speed', x: 750, y: 300, radius: 80 },
        ]
    }
];

const ArenaBuilder = ({ onLoadPreset, onSaveArena, onClearArena, currentShape, onShapeChange }: ArenaBuilderProps) => {
    const [customArenas, setCustomArenas] = useState<ArenaPreset[]>([]);
    const [arenaName, setArenaName] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('rps_custom_arenas');
        if (saved) {
            setCustomArenas(JSON.parse(saved));
        }
    }, []);

    const handleSave = () => {
        if (!arenaName.trim()) return;
        onSaveArena(arenaName);
        setArenaName('');
        // Refresh local list
        const saved = localStorage.getItem('rps_custom_arenas');
        if (saved) {
            setCustomArenas(JSON.parse(saved));
        }
    };

    return (
        <div className="arena-builder">
            <div className="input-group">
                <label>Interactive Editing</label>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 0.5rem 0' }}>
                    Left-click Arena to add random object.<br/>
                    Right-click to remove object.
                </p>
            </div>

            <div className="input-group">
                <label>Arena Shape</label>
                <select
                    value={currentShape}
                    onChange={(e) => onShapeChange(e.target.value as ArenaShape)}
                    className="modern-select"
                >
                    <option value="rectangle">Rectangle</option>
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                    <option value="hexagon">Hexagon</option>
                </select>
            </div>

            <div className="button-group" style={{ marginBottom: '1rem' }}>
                <button onClick={onClearArena} className="btn btn-reset">Clear Objects</button>
            </div>

            <div className="input-group">
                <label>Save Custom Arena</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={arenaName}
                        onChange={(e) => setArenaName(e.target.value)}
                        placeholder="Arena Name"
                    />
                    <button onClick={handleSave} className="btn btn-start">Save</button>
                </div>
            </div>

            <div className="presets-list" style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '0.5rem' }}>Presets</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {PRESETS.map(preset => (
                        <button
                            key={preset.name}
                            onClick={() => onLoadPreset(preset)}
                            className="btn"
                            style={{ background: '#374151' }}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            {customArenas.length > 0 && (
                <div className="custom-arenas-list" style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block', marginBottom: '0.5rem' }}>Your Arenas</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {customArenas.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => onLoadPreset(preset)}
                                className="btn"
                                style={{ background: '#1E3A8A' }}
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArenaBuilder;
