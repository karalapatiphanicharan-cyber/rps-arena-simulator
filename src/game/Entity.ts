import type { EntityData, EntityType, ArenaDimensions } from '../types/game';
import { getEmoji } from './Rules';

export class Entity implements EntityData {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  type: EntityType;

  constructor(data: EntityData) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.velocityX = data.velocityX;
    this.velocityY = data.velocityY;
    this.radius = data.radius;
    this.type = data.type;
  }

  update(arena: ArenaDimensions) {
    // Move
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Bounce off walls
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.velocityX *= -1;
    } else if (this.x + this.radius > arena.width) {
      this.x = arena.width - this.radius;
      this.velocityX *= -1;
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.velocityY *= -1;
    } else if (this.y + this.radius > arena.height) {
      this.y = arena.height - this.radius;
      this.velocityY *= -1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const emoji = getEmoji(this.type);
    ctx.font = `${this.radius * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, this.x, this.y);
  }
}
