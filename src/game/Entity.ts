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
  rotation: number = 0;
  rotationSpeed: number;

  constructor(data: EntityData) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.velocityX = data.velocityX;
    this.velocityY = data.velocityY;
    this.radius = 18; // Larger radius for Neo-Brutalism
    this.type = data.type;
    // Random initial rotation and rotation speed
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
  }

  update(arena: ArenaDimensions) {
    // Move
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Rotate while moving
    this.rotation += this.rotationSpeed;

    // Bounce off walls
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.velocityX *= -1;
      this.rotationSpeed *= -1;
    } else if (this.x + this.radius > arena.width) {
      this.x = arena.width - this.radius;
      this.velocityX *= -1;
      this.rotationSpeed *= -1;
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.velocityY *= -1;
      this.rotationSpeed *= -1;
    } else if (this.y + this.radius > arena.height) {
      this.y = arena.height - this.radius;
      this.velocityY *= -1;
      this.rotationSpeed *= -1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const emoji = getEmoji(this.type);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Add tiny bounce effect based on movement
    const bounce = Math.sin(Date.now() / 100) * 2;
    ctx.translate(0, bounce);

    ctx.font = `${this.radius * 2.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add subtle shadow for neo-brutalism feel on canvas
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.fillText(emoji, 0, 0);
    ctx.restore();
  }
}
