import type { EntityData } from '../types/game';
import { Entity } from './Entity';

/**
 * Checks if two entities are colliding (overlapping circles).
 */
export function checkCollision(e1: EntityData, e2: EntityData): boolean {
  const dx = e1.x - e2.x;
  const dy = e1.y - e2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < e1.radius + e2.radius;
}

/**
 * Handles elastic collision between two entities.
 * Updates their velocities based on a simple bounce effect.
 */
export function resolveCollision(e1: Entity, e2: Entity): void {
  const dx = e2.x - e1.x;
  const dy = e2.y - e1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return;

  // Normal vector
  const nx = dx / distance;
  const ny = dy / distance;

  // Relative velocity
  const rvx = e2.velocityX - e1.velocityX;
  const rvy = e2.velocityY - e1.velocityY;

  // Relative velocity in normal direction
  const velInNormal = rvx * nx + rvy * ny;

  // Do not resolve if velocities are separating
  if (velInNormal > 0) return;

  // Simple elastic bounce
  const impulse = -(1 + 0.8) * velInNormal;
  const impulseX = (impulse / 2) * nx;
  const impulseY = (impulse / 2) * ny;

  e1.velocityX -= impulseX;
  e1.velocityY -= impulseY;
  e2.velocityX += impulseX;
  e2.velocityY += impulseY;

  // Apply speed constraints immediately after collision
  e1.constrainSpeed();
  e2.constrainSpeed();

  // Separate entities slightly to prevent sticking
  const overlap = e1.radius + e2.radius - distance;
  if (overlap > 0) {
    const separationX = (overlap / 2 + 0.1) * nx;
    const separationY = (overlap / 2 + 0.1) * ny;
    e1.x -= separationX;
    e1.y -= separationY;
    e2.x += separationX;
    e2.y += separationY;
  }
}
