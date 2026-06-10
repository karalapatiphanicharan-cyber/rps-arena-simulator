import { Entity } from './Entity';
import type { ArenaDimensions, EntityType, GameCounts, GameStatus, ArenaShape } from '../types/game';
import { checkCollision, resolveCollision } from './Collision';
import { getWinningType } from './Rules';

export class GameEngine {
  private entities: Entity[] = [];
  private ctx: CanvasRenderingContext2D;
  private arena: ArenaDimensions;
  private shape: ArenaShape = 'rectangle';
  private animationId: number | null = null;
  private onStateChange: (state: { counts: GameCounts; status: GameStatus; winner: EntityType | null; arenaShape: ArenaShape }) => void;

  constructor(
    ctx: CanvasRenderingContext2D,
    arena: ArenaDimensions,
    onStateChange: (state: { counts: GameCounts; status: GameStatus; winner: EntityType | null; arenaShape: ArenaShape }) => void
  ) {
    this.ctx = ctx;
    this.arena = arena;
    this.onStateChange = onStateChange;
  }

  setArenaShape(shape: ArenaShape) {
    this.shape = shape;
    this.notifyState();
  }

  private isInside(x: number, y: number, radius: number): boolean {
    const { width, height } = this.arena;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (this.shape) {
      case 'rectangle':
        return (
          x - radius >= 0 &&
          x + radius <= width &&
          y - radius >= 0 &&
          y + radius <= height
        );
      case 'square': {
        const size = Math.min(width, height);
        const left = centerX - size / 2;
        const top = centerY - size / 2;
        return (
          x - radius >= left &&
          x + radius <= left + size &&
          y - radius >= top &&
          y + radius <= top + size
        );
      }
      case 'circle': {
        const r = Math.min(width, height) / 2 - radius;
        const dx = x - centerX;
        const dy = y - centerY;
        return Math.sqrt(dx * dx + dy * dy) <= r;
      }
      case 'triangle': {
        // Isosceles triangle
        const size = Math.min(width, height);
        const h = (size * Math.sqrt(3)) / 2;
        const p1 = { x: centerX, y: centerY - h / 2 };
        const p2 = { x: centerX - size / 2, y: centerY + h / 2 };
        const p3 = { x: centerX + size / 2, y: centerY + h / 2 };

        return this.pointInTriangle({ x, y }, p1, p2, p3, radius);
      }
      case 'hexagon': {
        const size = Math.min(width, height) / 2 - radius;
        return this.pointInHexagon(x - centerX, y - centerY, size);
      }
      default:
        return true;
    }
  }

  private pointInTriangle(p: { x: number, y: number }, p1: { x: number, y: number }, p2: { x: number, y: number }, p3: { x: number, y: number }, r: number) {
    const pt = p;
    const d1 = (pt.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (pt.y - p2.y);
    const d2 = (pt.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (pt.y - p3.y);
    const d3 = (pt.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (pt.y - p1.y);

    const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    if (has_neg && has_pos) return false;

    // Simple distance to edges for radius buffer
    const distToEdge = (pa: {x:number, y:number}, pb: {x:number, y:number}) => {
        const l2 = (pa.x-pb.x)**2 + (pa.y-pb.y)**2;
        if (l2 === 0) return Math.sqrt((pt.x-pa.x)**2 + (pt.y-pa.y)**2);
        let t = ((pt.x-pa.x)*(pb.x-pa.x) + (pt.y-pa.y)*(pb.y-pa.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt((pt.x - (pa.x + t*(pb.x-pa.x)))**2 + (pt.y - (pa.y + t*(pb.y-pa.y)))**2);
    }

    return distToEdge(p1, p2) >= r && distToEdge(p2, p3) >= r && distToEdge(p3, p1) >= r;
  }

  private pointInHexagon(dx: number, dy: number, r: number) {
    const q2x = Math.abs(dx);
    const q2y = Math.abs(dy);
    if (q2x > r * Math.sqrt(3) / 2 || q2y > r) return false;
    return r * r - r * q2y - 2 * (r / 2) * q2x / Math.sqrt(3) >= 0;
  }

  spawn(counts: GameCounts) {
    this.entities = [];
    const types: EntityType[] = ['rock', 'paper', 'scissors'];
    const radius = 12;

    types.forEach((type) => {
      for (let i = 0; i < counts[type]; i++) {
        let x, y, colliding;
        let attempts = 0;

        do {
          x = radius + Math.random() * (this.arena.width - 2 * radius);
          y = radius + Math.random() * (this.arena.height - 2 * radius);
          colliding = !this.isInside(x, y, radius);

          if (!colliding) {
            for (const entity of this.entities) {
              const dx = x - entity.x;
              const dy = y - entity.y;
              if (Math.sqrt(dx * dx + dy * dy) < radius + entity.radius) {
                colliding = true;
                break;
              }
            }
          }
          attempts++;
        } while (colliding && attempts < 200);

        const velocityX = (Math.random() - 0.5) * 4;
        const velocityY = (Math.random() - 0.5) * 4;

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
    this.draw();
    this.notifyState();
  }

  private update() {
    this.entities.forEach((entity) => {
        const oldX = entity.x;
        const oldY = entity.y;

        entity.update(this.arena);

        if (!this.isInside(entity.x, entity.y, entity.radius)) {
            // Very simple wall bounce: find normal and reflect
            const nx = this.getNormalX(entity.x, entity.y);
            const ny = this.getNormalY(entity.x, entity.y);

            // Reflect velocity: v = v - 2(v.n)n
            const dot = entity.velocityX * nx + entity.velocityY * ny;
            entity.velocityX -= 2 * dot * nx;
            entity.velocityY -= 2 * dot * ny;

            // Revert position and push in
            entity.x = oldX;
            entity.y = oldY;
            entity.x += nx * 2;
            entity.y += ny * 2;
        }
    });

    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const e1 = this.entities[i];
        const e2 = this.entities[j];

        if (checkCollision(e1, e2)) {
          resolveCollision(e1, e2);
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

  private getNormalX(x: number, y: number): number {
      const centerX = this.arena.width / 2;
      const centerY = this.arena.height / 2;

      if (this.shape === 'circle') {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          return -dx / dist;
      }

      if (this.shape === 'rectangle' || this.shape === 'square') {
          const size = this.shape === 'square' ? Math.min(this.arena.width, this.arena.height) : 0;
          const left = this.shape === 'square' ? centerX - size / 2 : 0;
          const right = this.shape === 'square' ? centerX + size / 2 : this.arena.width;
          if (x < left + 20) return 1;
          if (x > right - 20) return -1;
          return 0;
      }

      // Fallback to center for complex shapes
      const dx = x - centerX;
      const dist = Math.sqrt((x-centerX)**2 + (y-centerY)**2);
      return -dx / dist;
  }

  private getNormalY(x: number, y: number): number {
    const centerX = this.arena.width / 2;
    const centerY = this.arena.height / 2;

    if (this.shape === 'circle') {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        return -dy / dist;
    }

    if (this.shape === 'rectangle' || this.shape === 'square') {
        const size = this.shape === 'square' ? Math.min(this.arena.width, this.arena.height) : 0;
        const top = this.shape === 'square' ? centerY - size / 2 : 0;
        const bottom = this.shape === 'square' ? centerY + size / 2 : this.arena.height;
        if (y < top + 20) return 1;
        if (y > bottom - 20) return -1;
        return 0;
    }

    const dy = y - centerY;
    const dist = Math.sqrt((x-centerX)**2 + (y-centerY)**2);
    return -dy / dist;
  }

  private draw() {
    this.ctx.fillStyle = '#111827';
    this.ctx.fillRect(0, 0, this.arena.width, this.arena.height);

    // Draw boundary
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const { width, height } = this.arena;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (this.shape) {
        case 'rectangle':
            this.ctx.strokeRect(0, 0, width, height);
            break;
        case 'square': {
            const size = Math.min(width, height);
            this.ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
            break;
        }
        case 'circle':
            this.ctx.arc(centerX, centerY, Math.min(width, height) / 2, 0, Math.PI * 2);
            this.ctx.stroke();
            break;
        case 'triangle': {
            const size = Math.min(width, height);
            const h = (size * Math.sqrt(3)) / 2;
            this.ctx.moveTo(centerX, centerY - h / 2);
            this.ctx.lineTo(centerX - size / 2, centerY + h / 2);
            this.ctx.lineTo(centerX + size / 2, centerY + h / 2);
            this.ctx.closePath();
            this.ctx.stroke();
            break;
        }
        case 'hexagon': {
            const r = Math.min(width, height) / 2;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            break;
        }
    }

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
        arenaShape: this.shape
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
      arenaShape: this.shape
    });
  }
}
