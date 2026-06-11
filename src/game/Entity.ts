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
  private rotation = 0;
  private floatOffset = 0;
  private floatSpeed = Math.random() * 0.05 + 0.02;

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

  update(arena: ArenaDimensions, speedMultiplier: number = 1) {
    // Move
    this.x += this.velocityX * speedMultiplier;
    this.y += this.velocityY * speedMultiplier;

    // Animations
    this.floatOffset += this.floatSpeed * speedMultiplier;

    // Slight rotation based on movement
    const targetRotation = Math.atan2(this.velocityY, this.velocityX);
    // Smoothly interpolate rotation (subtle)
    this.rotation = targetRotation * 0.2;
  }

  constrainSpeed() {
    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);

    if (speed === 0) {
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
    const floatY = Math.sin(this.floatOffset) * 2;

    ctx.save();
    ctx.translate(this.x, this.y + floatY);
    ctx.rotate(this.rotation);

    ctx.font = `${this.radius * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 0);

    ctx.restore();
  }
}
