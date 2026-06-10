import { Entity } from './Entity';
import type { ArenaDimensions, EntityType, GameCounts, GameStatus } from '../types/game';
import { checkCollision, resolveCollision } from './Collision';
import { getWinningType } from './Rules';

export class GameEngine {
  private entities: Entity[] = [];
  private ctx: CanvasRenderingContext2D;
  private arena: ArenaDimensions;
  private animationId: number | null = null;
  private onStateChange: (state: { counts: GameCounts; status: GameStatus; winner: EntityType | null }) => void;

  constructor(
    ctx: CanvasRenderingContext2D,
    arena: ArenaDimensions,
    onStateChange: (state: { counts: GameCounts; status: GameStatus; winner: EntityType | null }) => void
  ) {
    this.ctx = ctx;
    this.arena = arena;
    this.onStateChange = onStateChange;
  }

  spawn(counts: GameCounts) {
    this.entities = [];
    const types: EntityType[] = ['rock', 'paper', 'scissors'];
    const radius = 12;

    types.forEach((type) => {
      for (let i = 0; i < counts[type]; i++) {
        let x, y, colliding;
        let attempts = 0;

        // Try to find a non-overlapping position
        do {
          x = radius + Math.random() * (this.arena.width - 2 * radius);
          y = radius + Math.random() * (this.arena.height - 2 * radius);
          colliding = false;

          for (const entity of this.entities) {
            const dx = x - entity.x;
            const dy = y - entity.y;
            if (Math.sqrt(dx * dx + dy * dy) < radius + entity.radius) {
              colliding = true;
              break;
            }
          }
          attempts++;
        } while (colliding && attempts < 100);

        const velocityX = (Math.random() - 0.5) * 4; // -2 to 2
        const velocityY = (Math.random() - 0.5) * 4; // -2 to 2

        this.entities.push(
          new Entity({
            id: `${type}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            x,
            y,
            velocityX,
            velocityY,
            radius,
            type,
          })
        );
      }
    });

    this.notifyState();
  }

  start() {
    if (this.animationId) return;
    const loop = () => {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  reset() {
    this.stop();
    this.entities = [];
    this.ctx.clearRect(0, 0, this.arena.width, this.arena.height);
    this.notifyState();
  }

  private update() {
    // Update positions
    this.entities.forEach((entity) => entity.update(this.arena));

    // Check collisions
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const e1 = this.entities[i];
        const e2 = this.entities[j];

        if (checkCollision(e1, e2)) {
          resolveCollision(e1, e2);

          // RPS Conversion
          const winnerType = getWinningType(e1.type, e2.type);
          if (winnerType) {
            e1.type = winnerType;
            e2.type = winnerType;
          }
        }
      }
    }

    this.checkWinner();
  }

  private draw() {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.arena.width, this.arena.height);
    this.entities.forEach((entity) => entity.draw(this.ctx));
  }

  private checkWinner() {
    const counts = this.getCounts();
    const activeTypes = (Object.keys(counts) as EntityType[]).filter((type) => counts[type] > 0);

    if (activeTypes.length === 1 && this.entities.length > 0) {
      this.stop();
      this.onStateChange({
        counts,
        status: 'finished',
        winner: activeTypes[0],
      });
    } else {
      this.notifyState();
    }
  }

  private getCounts(): GameCounts {
    return this.entities.reduce(
      (acc, entity) => {
        acc[entity.type]++;
        return acc;
      },
      { rock: 0, paper: 0, scissors: 0 } as GameCounts
    );
  }

  private notifyState() {
    this.onStateChange({
      counts: this.getCounts(),
      status: this.animationId ? 'running' : 'idle',
      winner: null,
    });
  }
}
