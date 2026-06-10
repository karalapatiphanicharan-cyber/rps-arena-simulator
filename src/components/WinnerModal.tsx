import React, { useEffect } from 'react';
import type { EntityType, GameCounts, PlayerNames } from '../types/game';
import { getEmoji } from '../game/Rules';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface WinnerModalProps {
  winner: EntityType | null;
  counts: GameCounts;
  playerNames: PlayerNames;
  onRestart: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, counts, playerNames, onRestart }) => {
  useEffect(() => {
    if (winner) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [winner]);

  if (!winner) return null;

  const totalEntities = counts.rock + counts.paper + counts.scissors;
  const winnerName = playerNames[winner];

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          className="winner-content"
          initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            🏆 {winnerName.toUpperCase()} DOMINATES!
          </motion.h1>

          <motion.div
            className="winner-emoji-large"
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {getEmoji(winner)}
          </motion.div>

          <p style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '30px' }}>
            TOTAL SURVIVORS: {totalEntities}
          </p>

          <motion.button
            onClick={onRestart}
            className="neo-btn start-btn"
            style={{ width: '100%', fontSize: '1.5rem' }}
            whileHover={{ x: -4, y: -4, boxShadow: "8px 8px 0px #000" }}
            whileTap={{ x: 4, y: 4, boxShadow: "0px 0px 0px #000" }}
          >
            PLAY AGAIN
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WinnerModal;
