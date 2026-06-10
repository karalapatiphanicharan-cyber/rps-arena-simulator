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

  private readonly minSpeed = 1.5;
  private readonly maxSpeed = 3.5;

  constructor(data: EntityData) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.velocityX = data.velocityX;
    this.velocityY = data.velocityY;
    this.radius = data.radius;
    this.type = data.type;
    this.constrainSpeed();
  }

  update(arena: ArenaDimensions) {
    // Move
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  constrainSpeed() {
    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);

    if (speed === 0) {
      // Give it a random kick if it's completely stopped
      const angle = Math.random() * Math.PI * 2;
      this.velocityX = Math.cos(angle) * this.minSpeed;
      this.velocityY = Math.sin(angle) * this.minSpeed;
      return;
    }

    if (speed < this.minSpeed) {
      const ratio = this.minSpeed / speed;
      this.velocityX *= ratio;
      this.velocityY *= ratio;
    } else if (speed > this.maxSpeed) {
      const ratio = this.maxSpeed / speed;
      this.velocityX *= ratio;
      this.velocityY *= ratio;
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
