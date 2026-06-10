import type { EntityType } from '../types/game';

/**
 * Determines the winner between two entity types.
 * Returns the winning type, or null if they are the same.
 */
export function getWinningType(type1: EntityType, type2: EntityType): EntityType | null {
  if (type1 === type2) return null;

  if (
    (type1 === 'rock' && type2 === 'scissors') ||
    (type1 === 'scissors' && type2 === 'paper') ||
    (type1 === 'paper' && type2 === 'rock')
  ) {
    return type1;
  }

  return type2;
}

/**
 * Returns the emoji representation of an entity type.
 */
export function getEmoji(type: EntityType): string {
  switch (type) {
    case 'rock':
      return '🪨';
    case 'paper':
      return '📄';
    case 'scissors':
      return '✂️';
  }
}
