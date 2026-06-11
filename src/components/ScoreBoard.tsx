import React from 'react';
import type { PlayerNames, EntityType, GameStats, TournamentState } from '../types/game';
import { getEmoji } from '../game/Rules';
import CollapsibleSection from './CollapsibleSection';

interface ScoreBoardProps {
  playerNames: PlayerNames;
  stats: GameStats;
  tournament: TournamentState;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ playerNames, stats, tournament }) => {
  const { counts, elapsedTime, arenaShape, totalCollisions, totalConversions, crazyMode } = stats;

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
      <CollapsibleSection title="Live Scoreboard" defaultExpanded icon="📊">
        <div className="score-cards">
          <div className="score-card rock">
            <div className="info">
              <span className="emoji">{getEmoji('rock')}</span>
              <span className="name">{playerNames.rock}</span>
            </div>
            <span className="count">{counts.rock}</span>
          </div>
          <div className="score-card paper">
            <div className="info">
              <span className="emoji">{getEmoji('paper')}</span>
              <span className="name">{playerNames.paper}</span>
            </div>
            <span className="count">{counts.paper}</span>
          </div>
          <div className="score-card scissors">
            <div className="info">
              <span className="emoji">{getEmoji('scissors')}</span>
              <span className="name">{playerNames.scissors}</span>
            </div>
            <span className="count">{counts.scissors}</span>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Statistics" defaultExpanded={false} icon="📈">
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

      {tournament.type !== 'single' && tournament.champion && (
          <CollapsibleSection title="Tournament Stats" defaultExpanded={false} icon="🏆">
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
