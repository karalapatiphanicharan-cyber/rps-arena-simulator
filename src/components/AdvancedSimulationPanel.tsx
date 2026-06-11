import React from 'react';

interface AdvancedSimulationPanelProps {
    enabled: boolean;
    aiEnabled: boolean;
    classDist: 'normal' | 'mixed' | 'random';
    aiDist: 'random' | 'smart' | 'mixed';
    onClassesToggle: (val: boolean) => void;
    onAIToggle: (val: boolean) => void;
    onClassDistChange: (val: any) => void;
    onAIDistChange: (val: any) => void;
}

const AdvancedSimulationPanel: React.FC<AdvancedSimulationPanelProps> = ({
    enabled, aiEnabled, classDist, aiDist,
    onClassesToggle, onAIToggle, onClassDistChange, onAIDistChange
}) => {
    return (
        <div className="advanced-sim-panel">
            <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ margin: 0 }}>Enable Unit Classes</label>
                <button
                    onClick={() => onClassesToggle(!enabled)}
                    className="btn"
                    style={{ background: enabled ? '#10B981' : '#374151' }}
                >
                    {enabled ? 'ON' : 'OFF'}
                </button>
            </div>

            {enabled && (
                <div className="input-group">
                    <label>Class Distribution</label>
                    <select
                        value={classDist}
                        onChange={(e) => onClassDistChange(e.target.value)}
                        className="modern-select"
                    >
                        <option value="normal">Normal Only</option>
                        <option value="mixed">Mixed Classes</option>
                        <option value="random">Random Classes</option>
                    </select>
                </div>
            )}

            <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                <label style={{ margin: 0 }}>🧠 Advanced AI</label>
                <button
                    onClick={() => onAIToggle(!aiEnabled)}
                    className="btn"
                    style={{ background: aiEnabled ? '#8B5CF6' : '#374151' }}
                >
                    {aiEnabled ? 'ON' : 'OFF'}
                </button>
            </div>

            {aiEnabled && (
                <div className="input-group">
                    <label>AI Modes</label>
                    <select
                        value={aiDist}
                        onChange={(e) => onAIDistChange(e.target.value)}
                        className="modern-select"
                    >
                        <option value="random">Random AI</option>
                        <option value="smart">Smart AI</option>
                        <option value="mixed">Mixed AI</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default AdvancedSimulationPanel;
