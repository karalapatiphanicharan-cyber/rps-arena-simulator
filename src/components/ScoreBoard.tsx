import React from 'react';
import type { PlayerNames, EntityType, GameStats, TournamentState } from '../types/game';
import CollapsibleSection from './CollapsibleSection';
import TypeIcon from './TypeIcon';

interface ScoreBoardProps {
  playerNames: PlayerNames;
  stats: GameStats;
  tournament: TournamentState;
  expandedStates: Record<string, boolean>;
  onToggleSection: (key: string, val: boolean) => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ playerNames, stats, tournament, expandedStates, onToggleSection }) => {
  const {
    counts, elapsedTime, arenaShape, totalCollisions, totalConversions, crazyMode,
    obstacleCollisions, speedZoneVisits, slowZoneVisits, chaosZoneVisits
  } = stats;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLeader = (): string => {
    const types: EntityType[] = ['rock', 'paper', 'scissors'];
    let max = -1;
    let leader = 'None';

    types.forEach(type => {
      if (counts[type] > max) {
        max = counts[type];
        leader = playerNames[type];
      } else if (counts[type] === max && max > 0) {
        leader = 'Tie';
      }
    });

    if (max === 0) return 'None';
    return leader;
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="scoreboard-container">
      <CollapsibleSection
        title="Live Scoreboard"
        expanded={expandedStates.scoreboard}
        onToggle={(v) => onToggleSection('scoreboard', v)}
        icon="📊"
      >
        <div className="score-cards">
          <div className="score-card rock">
            <div className="info">
              <span className="emoji"><TypeIcon type="rock" size={24} /></span>
              <span className="name">{playerNames.rock}</span>
            </div>
            <span className="count">{counts.rock}</span>
          </div>
          <div className="score-card paper">
            <div className="info">
              <span className="emoji"><TypeIcon type="paper" size={24} /></span>
              <span className="name">{playerNames.paper}</span>
            </div>
            <span className="count">{counts.paper}</span>
          </div>
          <div className="score-card scissors">
            <div className="info">
              <span className="emoji"><TypeIcon type="scissors" size={24} /></span>
              <span className="name">{playerNames.scissors}</span>
            </div>
            <span className="count">{counts.scissors}</span>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Statistics"
        expanded={expandedStates.stats}
        onToggle={(v) => onToggleSection('stats', v)}
        icon="📈"
      >
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Collisions</span>
            <span className="stat-value">{totalCollisions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Conversions</span>
            <span className="stat-value">{totalConversions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Obstacle Collisions</span>
            <span className="stat-value">{obstacleCollisions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Elapsed Time</span>
            <span className="stat-value">{formatTime(elapsedTime)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Current Leader</span>
            <span className="stat-value">{getLeader()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Arena Shape</span>
            <span className="stat-value">{capitalize(arenaShape)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Zone Visits (Sp/Sl/Ch)</span>
            <span className="stat-value">{speedZoneVisits} / {slowZoneVisits} / {chaosZoneVisits}</span>
          </div>
        </div>
      </CollapsibleSection>

      {crazyMode && crazyMode.eventsTriggered > 0 && (
          <CollapsibleSection title="Crazy Mode Stats" defaultExpanded={false} icon="🎭">
              <div className="stats-grid">
                  <div className="stat-item">
                      <span className="stat-label">Events Triggered</span>
                      <span className="stat-value">{crazyMode.eventsTriggered}</span>
                  </div>
                  <div className="stat-item">
                      <span className="stat-label">Meteor Eliminations</span>
                      <span className="stat-value">{crazyMode.meteorEliminations}</span>
                  </div>
                  <div className="stat-item">
                      <span className="stat-label">Frozen Count</span>
                      <span className="stat-value">{crazyMode.freezeCount}</span>
                  </div>
                  <div className="stat-item">
                      <span className="stat-label">Boosts / Reversals</span>
                      <span className="stat-value">{crazyMode.speedBoostActivations} / {crazyMode.ruleReversals}</span>
                  </div>
              </div>
          </CollapsibleSection>
      )}

      {stats.advanced && (
          <CollapsibleSection
            title="Advanced Stats"
            expanded={expandedStates.advStats}
            onToggle={(v) => onToggleSection('advStats', v)}
            icon="🧠"
          >
              <div className="stats-grid">
                  <div className="stat-group-title" style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.5rem', borderBottom: '1px solid #374151' }}>Class Wins</div>
                  <div className="stat-item">
                      <span className="stat-label">⚡ Speed / 🛡 Tank</span>
                      <span className="stat-value">{stats.advanced.classStats.speedWins} / {stats.advanced.classStats.tankWins}</span>
                  </div>
                  <div className="stat-item">
                      <span className="stat-label">🔥 Berserker / Normal</span>
                      <span className="stat-value">{stats.advanced.classStats.berserkerWins} / {stats.advanced.classStats.normalWins}</span>
                  </div>

                  <div className="stat-group-title" style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.5rem', borderBottom: '1px solid #374151' }}>AI Mode Wins</div>
                  <div className="stat-item">
                      <span className="stat-label">Smart / Aggressive</span>
                      <span className="stat-value">{stats.advanced.aiStats.smartWins} / {stats.advanced.aiStats.aggressiveWins}</span>
                  </div>
                  <div className="stat-item">
                      <span className="stat-label">Hunter / Defensive</span>
                      <span className="stat-value">{stats.advanced.aiStats.hunterWins} / {stats.advanced.aiStats.defensiveWins}</span>
                  </div>
              </div>
          </CollapsibleSection>
      )}

      {tournament.type !== 'single' && tournament.champion && (
          <CollapsibleSection
            title="Tournament Stats"
            expanded={expandedStates.tournStats}
            onToggle={(v) => onToggleSection('tournStats', v)}
            icon="🏆"
          >
              <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-label">Avg Round Time</span>
                    <span className="stat-value">{formatTime(tournament.stats.averageRoundTime)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Longest Round</span>
                    <span className="stat-value">{formatTime(tournament.stats.longestRound)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Shortest Round</span>
                    <span className="stat-value">{formatTime(tournament.stats.shortestRound)}</span>
                </div>
              </div>
          </CollapsibleSection>
      )}
    </div>
  );
};

export default ScoreBoard;
