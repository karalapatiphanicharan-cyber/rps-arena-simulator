import type { EntityData, EntityType, ArenaDimensions, UnitClass, AIMode } from '../types/game';
import { getEmoji } from './Rules';

export class Entity implements EntityData {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  type: EntityType;
  unitClass: UnitClass;
  aiMode: AIMode;

  frozen: boolean = false;
  isGiant: boolean = false;
  private baseRadius: number;

  private minSpeed = 3.0;
  private maxSpeed = 7.0;
  private rotation = 0;
  private floatOffset = 0;
  private floatSpeed = Math.random() * 0.05 + 0.02;

  constructor(data: EntityData) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.velocityX = data.velocityX;
    this.velocityY = data.velocityY;
    this.type = data.type;
    this.unitClass = data.unitClass || 'normal';
    this.aiMode = data.aiMode || 'random';

    // Class properties
    this.radius = data.radius;
    if (this.unitClass === 'speed') {
        this.radius *= 0.7; // Even smaller
        this.minSpeed = 5.0; // 50% faster than 3.3 approx
        this.maxSpeed = 10.0;
    } else if (this.unitClass === 'tank') {
        this.radius *= 1.8; // Larger
        this.minSpeed = 2.0; // Slower
        this.maxSpeed = 4.0;
    } else if (this.unitClass === 'berserker') {
        this.minSpeed = 4.0;
        this.maxSpeed = 8.0;
    }

    this.baseRadius = this.radius;
    this.constrainSpeed();
  }

  update(_arena: ArenaDimensions, entities: Entity[], speedMultiplier: number = 1) {
    if (this.frozen) return;

    // AI Logic
    this.applyAI(entities);

    // Giant logic
    const targetRadius = this.isGiant ? this.baseRadius * 3 : this.baseRadius;
    if (this.radius !== targetRadius) {
        this.radius += (targetRadius - this.radius) * 0.1;
    }

    // Move
    this.x += this.velocityX * speedMultiplier;
    this.y += this.velocityY * speedMultiplier;

    // Animations
    this.floatOffset += this.floatSpeed * speedMultiplier;

    // Slight rotation based on movement
    const targetRotation = Math.atan2(this.velocityY, this.velocityX);
    this.rotation = targetRotation * 0.2;

    this.constrainSpeed();
  }

  private applyAI(entities: Entity[]) {
    if (this.aiMode === 'random') return;

    const preyType = this.getPreyType();
    const predatorType = this.getPredatorType();

    let steerX = 0;
    let steerY = 0;

    if (this.aiMode === 'aggressive' || this.aiMode === 'hunter' || this.aiMode === 'smart' || this.unitClass === 'berserker') {
        const target = this.findNearest(entities, preyType);
        if (target) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const force = (this.aiMode === 'hunter' || this.unitClass === 'berserker') ? 0.4 : 0.25;
            steerX += (dx / dist) * force;
            steerY += (dy / dist) * force;
        }
    }

    if (this.aiMode === 'defensive' || this.aiMode === 'smart') {
        const threat = this.findNearest(entities, predatorType);
        if (threat) {
            const dx = this.x - threat.x;
            const dy = this.y - threat.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                steerX += (dx / dist) * 0.3;
                steerY += (dy / dist) * 0.3;
            }
        }
    }

    if (this.aiMode === 'chaotic') {
        if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            steerX += Math.cos(angle) * 0.5;
            steerY += Math.sin(angle) * 0.5;
        }
    }

    this.velocityX += steerX;
    this.velocityY += steerY;
  }

  private findNearest(entities: Entity[], type: EntityType): Entity | null {
    let nearest: Entity | null = null;
    let minDist = Infinity;

    for (const e of entities) {
        if (e === this || e.type !== type) continue;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const dist = dx*dx + dy*dy;
        if (dist < minDist) {
            minDist = dist;
            nearest = e;
        }
    }
    return nearest;
  }

  private getPreyType(): EntityType {
      if (this.type === 'rock') return 'scissors';
      if (this.type === 'paper') return 'rock';
      return 'paper';
  }

  private getPredatorType(): EntityType {
      if (this.type === 'rock') return 'paper';
      if (this.type === 'paper') return 'scissors';
      return 'rock';
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

    if (this.frozen) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#3B82F6';
    }

    if (this.isGiant) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#F97316';
    }

    // Class visuals
    if (this.unitClass === 'speed') {
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#FACC15';
    } else if (this.unitClass === 'tank') {
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#4B5563';
    } else if (this.unitClass === 'berserker') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#EF4444';
    }

    ctx.font = `${this.radius * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 0);

    // Class icon
    let classIcon = '';
    if (this.unitClass === 'speed') classIcon = '⚡';
    else if (this.unitClass === 'tank') classIcon = '🛡';
    else if (this.unitClass === 'berserker') classIcon = '🔥';

    if (classIcon) {
        ctx.font = `${this.radius}px serif`;
        ctx.fillText(classIcon, this.radius, -this.radius);
    }

    ctx.restore();
  }
}
