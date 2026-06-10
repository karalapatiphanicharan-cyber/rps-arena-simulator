import React from 'react';
import type { GameCounts, PlayerNames, EntityType } from '../types/game';
import { getEmoji } from '../game/Rules';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreBoardProps {
  counts: GameCounts;
  playerNames: PlayerNames;
}

const ScoreCard: React.FC<{ type: EntityType; name: string; count: number }> = ({ type, name, count }) => {
  return (
    <motion.div
      className={`score-card ${type}`}
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <div className="emoji" style={{ fontSize: '3rem' }}>{getEmoji(type)}</div>
      <div className="type-label">{name}</div>
      <AnimatePresence mode='wait'>
        <motion.div
          key={count}
          className="count-value"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {count}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

const ScoreBoard: React.FC<ScoreBoardProps> = ({ counts, playerNames }) => {
  return (
    <motion.div
      className="neo-card scoreboard"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <h2>Scoreboard</h2>
      <ScoreCard type="rock" name={playerNames.rock} count={counts.rock} />
      <ScoreCard type="paper" name={playerNames.paper} count={counts.paper} />
      <ScoreCard type="scissors" name={playerNames.scissors} count={counts.scissors} />
    </motion.div>
  );
};

export default ScoreBoard;
