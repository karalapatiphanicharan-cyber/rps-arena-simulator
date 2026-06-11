import { Entity } from './Entity';
import type {
  ArenaDimensions,
  EntityType,
  GameCounts,
  GameStatus,
  ArenaShape,
  BattleEvent,
  GameState,
  CrazyEventName,
  Obstacle,
  PowerZone,
  ObstacleDensity
} from '../types/game';
import { checkCollision, resolveCollision } from './Collision';
import { getWinningType } from './Rules';
import { EffectManager } from './EffectManager';
import { ParticleManager } from './ParticleManager';
import { soundManager } from './SoundManager';
import { CrazyEventManager } from './CrazyEventManager';

export class GameEngine {
  private entities: Entity[] = [];
  private ctx: CanvasRenderingContext2D;
  private arena: ArenaDimensions;
  private shape: ArenaShape = 'rectangle';
  private animationId: number | null = null;
  private status: GameStatus = 'idle';
  private simulationSpeed: number = 1;
  private obstacleDensity: ObstacleDensity = 'off';
  private powerZonesEnabled: boolean = false;
  private obstacles: Obstacle[] = [];
  private powerZones: PowerZone[] = [];
  private manualObstacles: Obstacle[] = [];
  private manualPowerZones: PowerZone[] = [];

  private effectManager = new EffectManager();
  private particleManager: ParticleManager;
  private crazyEventManager = new CrazyEventManager();

  private totalCollisions = 0;
  private totalConversions = 0;
  private obstacleCollisions = 0;
  private speedZoneVisits = 0;
  private slowZoneVisits = 0;
  private chaosZoneVisits = 0;
  private events: BattleEvent[] = [];
  private startTime: number = 0;
  private elapsedAtPause: number = 0;

  private onStateChange: (state: GameState) => void;
  private lastNotifyTime: number = 0;
  private readonly THROTTLE_MS = 200;

  constructor(
    ctx: CanvasRenderingContext2D,
    arena: ArenaDimensions,
    onStateChange: (state: GameState) => void
  ) {
    this.ctx = ctx;
    this.arena = arena;
    this.onStateChange = onStateChange;
    this.particleManager = new ParticleManager(arena.width, arena.height);
  }

  setArenaShape(shape: ArenaShape) {
    this.shape = shape;
    this.notifyState(null, true);
  }

  setSimulationSpeed(speed: number) {
    this.simulationSpeed = speed;
    this.notifyState(null, true);
  }

  setObstacles(density: ObstacleDensity) {
      this.obstacleDensity = density;
      this.generateArenaFeatures();
      this.notifyState(null, true);
  }

  setPowerZones(enabled: boolean) {
      this.powerZonesEnabled = enabled;
      this.generateArenaFeatures();
      this.notifyState(null, true);
  }

  setManualFeatures(obstacles: Obstacle[], zones: PowerZone[]) {
      this.manualObstacles = obstacles;
      this.manualPowerZones = zones;
      this.notifyState(null, true);
  }

  setCrazyMode(enabled: boolean) {
      this.crazyEventManager.setEnabled(enabled);
      this.notifyState(null, true);
  }

  triggerCrazyEvent(name: CrazyEventName) {
      if (this.crazyEventManager.getState().enabled) {
          this.crazyEventManager.triggerEvent(name);
          this.notifyState(null, true);
      }
  }

  getObjectAt(x: number, y: number): { type: 'obstacle' | 'zone', id: string } | null {
      for (const obs of this.manualObstacles) {
          if (obs.type === 'wall' && obs.width && obs.height) {
              if (x > obs.x - obs.width/2 && x < obs.x + obs.width/2 &&
                  y > obs.y - obs.height/2 && y < obs.y + obs.height/2) return { type: 'obstacle', id: obs.id };
          } else if (obs.radius) {
              const dx = x - obs.x;
              const dy = y - obs.y;
              if (Math.sqrt(dx*dx + dy*dy) < obs.radius) return { type: 'obstacle', id: obs.id };
          }
      }
      for (const zone of this.manualPowerZones) {
          const dx = x - zone.x;
          const dy = y - zone.y;
          if (Math.sqrt(dx*dx + dy*dy) < zone.radius) return { type: 'zone', id: zone.id };
      }
      return null;
  }

  private isInside(x: number, y: number, radius: number): boolean {
    const { width, height } = this.arena;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (this.shape) {
      case 'rectangle':
        return x - radius >= 0 && x + radius <= width && y - radius >= 0 && y + radius <= height;
      case 'square': {
        const size = Math.min(width, height);
        const left = centerX - size / 2;
        const top = centerY - size / 2;
        return x - radius >= left && x + radius <= left + size && y - radius >= top && y + radius <= top + size;
      }
      case 'circle': {
        const r = Math.min(width, height) / 2 - radius;
        const dx = x - centerX;
        const dy = y - centerY;
        return Math.sqrt(dx * dx + dy * dy) <= r;
      }
      case 'triangle': {
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

  spawn(counts: GameCounts, skipFeatureGeneration: boolean = false) {
    this.entities = [];
    this.totalCollisions = 0;
    this.totalConversions = 0;
    this.obstacleCollisions = 0;
    this.speedZoneVisits = 0;
    this.slowZoneVisits = 0;
    this.chaosZoneVisits = 0;
    this.events = [];
    if (!skipFeatureGeneration) {
        this.generateArenaFeatures();
    }
    this.effectManager.clear();
    this.crazyEventManager.reset(this.crazyEventManager.getState().enabled);
    this.startTime = Date.now();
    this.elapsedAtPause = 0;

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
          if (!colliding) {
              const allObs = [...this.obstacles, ...this.manualObstacles];
              for (const obs of allObs) {
                  if (obs.type === 'wall' && obs.width && obs.height) {
                      if (x + radius > obs.x - obs.width/2 - 5 && x - radius < obs.x + obs.width/2 + 5 &&
                          y + radius > obs.y - obs.height/2 - 5 && y - radius < obs.y + obs.height/2 + 5) {
                          colliding = true;
                          break;
                      }
                  } else if (obs.radius) {
                      const dx = x - obs.x;
                      const dy = y - obs.y;
                      if (Math.sqrt(dx*dx + dy*dy) < radius + obs.radius + 5) {
                          colliding = true;
                          break;
                      }
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
    this.status = 'idle';
    this.notifyState(null, true);
  }

  start() {
    if (this.status === 'running') return;
    if (this.status === 'paused') {
        this.startTime = Date.now() - this.elapsedAtPause * 1000;
    } else {
        this.startTime = Date.now();
    }
    this.status = 'running';
    const loop = () => {
      if (this.status !== 'running') return;
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  pause() {
    if (this.status !== 'running') return;
    this.status = 'paused';
    this.elapsedAtPause = (Date.now() - this.startTime) / 1000;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.notifyState(null, true);
  }

  stop() {
    this.status = 'idle';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  reset() {
    this.stop();
    this.entities = [];
    this.totalCollisions = 0;
    this.totalConversions = 0;
    this.events = [];
    this.effectManager.clear();
    this.elapsedAtPause = 0;
    this.draw();
    this.notifyState(null, true);
  }

  private generateArenaFeatures() {
    this.obstacles = [];
    this.powerZones = [];

    if (this.obstacleDensity !== 'off') {
        const count = this.obstacleDensity === 'low' ? 2 : (this.obstacleDensity === 'medium' ? 4 : 6);
        for (let i = 0; i < count; i++) {
            let x, y, obstacle: Obstacle;
            let attempts = 0;
            const type = (['wall', 'boulder', 'moving'] as const)[Math.floor(Math.random() * 3)];

            do {
                x = 100 + Math.random() * (this.arena.width - 200);
                y = 100 + Math.random() * (this.arena.height - 200);
                if (type === 'wall') {
                    obstacle = { id: `obs-${i}`, type, x, y, width: 40 + Math.random() * 60, height: 20 + Math.random() * 30 };
                } else if (type === 'boulder') {
                    obstacle = { id: `obs-${i}`, type, x, y, radius: 20 + Math.random() * 20 };
                } else {
                    obstacle = { id: `obs-${i}`, type, x, y, radius: 25, velocityX: (Math.random() - 0.5) * 2, velocityY: (Math.random() - 0.5) * 2 };
                }
                attempts++;
            } while (!this.isPositionClear(x, y, 50) && attempts < 50);

            this.obstacles.push(obstacle);
        }
    }

    if (this.powerZonesEnabled) {
        const types = ['speed', 'slow', 'chaos'] as const;
        types.forEach((type, i) => {
            let x, y;
            let attempts = 0;
            do {
                x = 100 + Math.random() * (this.arena.width - 200);
                y = 100 + Math.random() * (this.arena.height - 200);
                attempts++;
            } while (!this.isPositionClear(x, y, 60) && attempts < 50);
            this.powerZones.push({ id: `zone-${i}`, type, x, y, radius: 50 + Math.random() * 30 });
        });
    }
  }

  private isPositionClear(x: number, y: number, radius: number): boolean {
      if (!this.isInside(x, y, radius)) return false;
      const allObs = [...this.obstacles, ...this.manualObstacles];
      for (const obs of allObs) {
          const dx = x - obs.x;
          const dy = y - obs.y;
          if (Math.sqrt(dx * dx + dy * dy) < radius + (obs.radius || 40)) return false;
      }
      return true;
  }

  private update() {
    const sm = this.simulationSpeed;
    const activeEvent = this.crazyEventManager.update();
    let speedMult = sm;
    let ruleReversed = false;

    if (activeEvent) {
        if (activeEvent.name === 'Speed Boost') speedMult *= 2;
        if (activeEvent.name === 'Reverse Rules') ruleReversed = true;

        if (activeEvent.name === 'Freeze Wave' && !activeEvent.data?.applied) {
            let frozenCount = 0;
            this.entities.forEach(e => {
                if (Math.random() < 0.25) {
                    e.frozen = true;
                    frozenCount++;
                }
            });
            activeEvent.data = { applied: true };
            this.crazyEventManager.addFreezeCount(frozenCount);
        }

        if (activeEvent.name === 'Chaos Storm' && !activeEvent.data?.applied) {
            this.entities.forEach(e => {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.sqrt(e.velocityX**2 + e.velocityY**2);
                e.velocityX = Math.cos(angle) * speed;
                e.velocityY = Math.sin(angle) * speed;
            });
            activeEvent.data = { applied: true };
        }

        if (activeEvent.name === 'Double Population' && !activeEvent.data?.applied) {
            const type = activeEvent.data.type as EntityType;
            const toDuplicate = this.entities.filter(e => e.type === type);
            const count = Math.floor(toDuplicate.length * 0.2);
            for(let i=0; i<count; i++) {
                const source = toDuplicate[Math.floor(Math.random() * toDuplicate.length)];
                if (source) {
                    this.entities.push(new Entity({
                        id: `${type}-dup-${Date.now()}-${i}`,
                        x: source.x,
                        y: source.y,
                        velocityX: (Math.random() - 0.5) * 4,
                        velocityY: (Math.random() - 0.5) * 4,
                        radius: source.radius,
                        type: type
                    }));
                }
            }
            activeEvent.data.applied = true;
        }

        if (activeEvent.name === 'Giant Entity' && !activeEvent.data?.targetId) {
            const target = this.entities[Math.floor(Math.random() * this.entities.length)];
            if (target) {
                target.isGiant = true;
                activeEvent.data.targetId = target.id;
            }
        }

        if (activeEvent.name === 'Meteor Strike') {
            const { x, y, radius, warningDuration, impacted } = activeEvent.data;
            const targetX = x * this.arena.width;
            const targetY = y * this.arena.height;

            if (!impacted && Date.now() - activeEvent.startTime > warningDuration) {
                const beforeCount = this.entities.length;
                this.entities = this.entities.filter(e => {
                    const dx = e.x - targetX;
                    const dy = e.y - targetY;
                    return Math.sqrt(dx*dx + dy*dy) > radius;
                });
                this.crazyEventManager.addMeteorEliminations(beforeCount - this.entities.length);
                activeEvent.data.impacted = true;
                this.effectManager.addEffect({
                    id: `meteor-expl-${Date.now()}`,
                    x: targetX,
                    y: targetY,
                    type: 'explosion',
                    startTime: Date.now(),
                    duration: 1000,
                    radius: radius
                });
                soundManager.playWinner(); // Using winner sound as explosion placeholder
            } else if (!impacted) {
                // Add warning effect periodically
                this.effectManager.addEffect({
                    id: `meteor-warn-${Date.now()}`,
                    x: targetX,
                    y: targetY,
                    type: 'meteor_warning',
                    startTime: Date.now(),
                    duration: 100, // Very short for consistent pulse
                    radius: radius
                });
            }
        }
    } else {
        // Reset effects if no event is active
        this.entities.forEach(e => {
            e.frozen = false;
            e.isGiant = false;
        });
    }

    this.particleManager.update(sm);
    this.effectManager.update();

    // Update moving obstacles
    const allObs = [...this.obstacles, ...this.manualObstacles];
    allObs.forEach(obs => {
        if (obs.type === 'moving' && obs.velocityX !== undefined && obs.velocityY !== undefined) {
            obs.x += obs.velocityX * speedMult;
            obs.y += obs.velocityY * speedMult;
            if (!this.isInside(obs.x, obs.y, obs.radius || 0)) {
                obs.velocityX *= -1;
                obs.velocityY *= -1;
            }
        }
    });

    this.entities.forEach((entity) => {
        const oldX = entity.x;
        const oldY = entity.y;

        // Power Zone logic
        let entitySpeedMult = speedMult;
        const allZones = [...this.powerZones, ...this.manualPowerZones];
        allZones.forEach(zone => {
            const dx = entity.x - zone.x;
            const dy = entity.y - zone.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < zone.radius) {
                if (zone.type === 'speed') {
                    entitySpeedMult *= 1.5;
                    if (Math.random() < 0.05) this.speedZoneVisits++;
                } else if (zone.type === 'slow') {
                    entitySpeedMult *= 0.7;
                    if (Math.random() < 0.05) this.slowZoneVisits++;
                } else if (zone.type === 'chaos') {
                    if (Math.random() < 0.016) { // Approx once per second at 60fps
                        const angle = Math.random() * Math.PI * 2;
                        const speed = Math.sqrt(entity.velocityX**2 + entity.velocityY**2);
                        entity.velocityX = Math.cos(angle) * speed;
                        entity.velocityY = Math.sin(angle) * speed;
                        this.chaosZoneVisits++;
                    }
                }
            }
        });

        entity.update(this.arena, entitySpeedMult);

        if (!this.isInside(entity.x, entity.y, entity.radius)) {
            const nx = this.getNormalX(entity.x, entity.y);
            const ny = this.getNormalY(entity.x, entity.y);
            const dot = entity.velocityX * nx + entity.velocityY * ny;
            entity.velocityX -= 2 * dot * nx;
            entity.velocityY -= 2 * dot * ny;
            entity.x = oldX;
            entity.y = oldY;
            entity.x += nx * 2;
            entity.y += ny * 2;
        }

        // Obstacle collisions
        allObs.forEach(obs => {
            if (obs.type === 'wall' && obs.width !== undefined && obs.height !== undefined) {
                if (entity.x + entity.radius > obs.x - obs.width/2 &&
                    entity.x - entity.radius < obs.x + obs.width/2 &&
                    entity.y + entity.radius > obs.y - obs.height/2 &&
                    entity.y - entity.radius < obs.y + obs.height/2) {

                    const dx = entity.x - obs.x;
                    const dy = entity.y - obs.y;
                    if (Math.abs(dx / obs.width) > Math.abs(dy / obs.height)) {
                        entity.velocityX *= -1;
                        entity.x = oldX + entity.velocityX;
                    } else {
                        entity.velocityY *= -1;
                        entity.y = oldY + entity.velocityY;
                    }
                    this.obstacleCollisions++;
                    soundManager.playCollision();
                }
            } else if ((obs.type === 'boulder' || obs.type === 'moving') && obs.radius !== undefined) {
                const dx = entity.x - obs.x;
                const dy = entity.y - obs.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < entity.radius + obs.radius) {
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const dot = entity.velocityX * nx + entity.velocityY * ny;
                    if (dot < 0) {
                        entity.velocityX -= 2 * dot * nx;
                        entity.velocityY -= 2 * dot * ny;
                        entity.x = oldX + entity.velocityX;
                        entity.y = oldY + entity.velocityY;
                        this.obstacleCollisions++;
                        soundManager.playCollision();
                    }
                }
            }
        });
    });

    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const e1 = this.entities[i];
        const e2 = this.entities[j];

        if (checkCollision(e1, e2)) {
          this.totalCollisions++;
          soundManager.playCollision();
          this.effectManager.addEffect({
              id: `coll-${Date.now()}-${Math.random()}`,
              x: (e1.x + e2.x) / 2,
              y: (e1.y + e2.y) / 2,
              type: 'collision',
              startTime: Date.now(),
              duration: 250
          });

          resolveCollision(e1, e2);
          let winnerType = getWinningType(e1.type, e2.type);

          if (ruleReversed && winnerType) {
              winnerType = winnerType === e1.type ? e2.type : e1.type;
          }

          if (winnerType) {
            if (e1.type !== winnerType || e2.type !== winnerType) {
                this.totalConversions++;
                soundManager.playConversion();
                const loserType = e1.type === winnerType ? e2.type : e1.type;
                this.addEvent(winnerType, loserType);

                if (e1.type !== winnerType) {
                    this.effectManager.addEffect({
                        id: `conv-${e1.id}-${Date.now()}`,
                        x: e1.x,
                        y: e1.y,
                        type: 'conversion',
                        startTime: Date.now(),
                        duration: 300,
                        color: this.getColorForType(winnerType)
                    });
                }
                if (e2.type !== winnerType) {
                    this.effectManager.addEffect({
                        id: `conv-${e2.id}-${Date.now()}`,
                        x: e2.x,
                        y: e2.y,
                        type: 'conversion',
                        startTime: Date.now(),
                        duration: 300,
                        color: this.getColorForType(winnerType)
                    });
                }
                e1.type = winnerType;
                e2.type = winnerType;
            }
          }
        }
      }
    }

    this.checkWinner();
  }

  private getColorForType(type: EntityType): string {
      switch(type) {
          case 'rock': return '#EF4444';
          case 'paper': return '#3B82F6';
          case 'scissors': return '#FACC15';
          default: return '#FFFFFF';
      }
  }

  private addEvent(winner: EntityType, loser: EntityType) {
      const event: BattleEvent = {
          id: `evt-${Date.now()}-${Math.random()}`,
          type: 'conversion',
          winner,
          loser,
          timestamp: Date.now()
      };
      this.events = [event, ...this.events].slice(0, 5);
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

    this.particleManager.draw(this.ctx);

    // Draw boundary with glow
    this.ctx.save();
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 3;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#3B82F6';
    this.ctx.beginPath();

    const { width, height } = this.arena;
    const centerX = width / 2;
    const centerY = height / 2;

    switch (this.shape) {
        case 'rectangle':
            this.ctx.strokeRect(2, 2, width-4, height-4);
            break;
        case 'square': {
            const size = Math.min(width, height);
            this.ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
            break;
        }
        case 'circle':
            this.ctx.arc(centerX, centerY, Math.min(width, height) / 2 - 2, 0, Math.PI * 2);
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
            const r = Math.min(width, height) / 2 - 2;
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
    this.ctx.restore();

    // Draw Power Zones
    const allZones = [...this.powerZones, ...this.manualPowerZones];
    allZones.forEach(zone => {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        const color = zone.type === 'speed' ? '#FACC1533' : (zone.type === 'slow' ? '#3B82F633' : '#A855F733');
        const borderColor = zone.type === 'speed' ? '#FACC15' : (zone.type === 'slow' ? '#3B82F6' : '#A855F7');
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineDashOffset = Date.now() / 50;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    });

    // Draw Obstacles
    const allObs = [...this.obstacles, ...this.manualObstacles];
    allObs.forEach(obs => {
        this.ctx.save();
        this.ctx.fillStyle = '#4B5563';
        this.ctx.strokeStyle = '#94A3B8';
        this.ctx.lineWidth = 2;
        if (obs.type === 'wall' && obs.width && obs.height) {
            this.ctx.translate(obs.x, obs.y);
            this.ctx.fillRect(-obs.width/2, -obs.height/2, obs.width, obs.height);
            this.ctx.strokeRect(-obs.width/2, -obs.height/2, obs.width, obs.height);
        } else if (obs.radius) {
            this.ctx.beginPath();
            this.ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
        this.ctx.restore();
    });

    this.entities.forEach((entity) => entity.draw(this.ctx));
    this.effectManager.draw(this.ctx);
  }

  private checkWinner() {
    const counts = this.getCounts();
    const activeTypes = (Object.keys(counts) as EntityType[]).filter((type) => counts[type] > 0);

    if (activeTypes.length === 1 && this.entities.length > 0) {
      this.status = 'finished';
      soundManager.playWinner();
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.notifyState(activeTypes[0], true);
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

  private notifyState(winner: EntityType | null = null, force: boolean = false) {
    const now = Date.now();
    if (!force && now - this.lastNotifyTime < this.THROTTLE_MS) {
        return;
    }
    this.lastNotifyTime = now;

    const counts = this.getCounts();
    const elapsedTime = this.status === 'paused'
        ? this.elapsedAtPause
        : (now - this.startTime) / 1000;
    const crazyState = this.crazyEventManager.getState();

    this.onStateChange({
      counts,
      status: this.status,
      winner: winner,
      arenaShape: this.shape,
      simulationSpeed: this.simulationSpeed,
      events: this.events,
      stats: {
          totalCollisions: this.totalCollisions,
          totalConversions: this.totalConversions,
          counts,
          elapsedTime,
          arenaShape: this.shape,
          crazyMode: crazyState.stats,
          obstacleCollisions: this.obstacleCollisions,
          speedZoneVisits: this.speedZoneVisits,
          slowZoneVisits: this.slowZoneVisits,
          chaosZoneVisits: this.chaosZoneVisits
      },
      tournament: {} as any, // Placeholder, App.tsx handles this
      crazyMode: crazyState,
      obstacles: this.obstacleDensity,
      powerZones: this.powerZonesEnabled,
      autoPlay: false, // Managed by App.tsx
      manualObstacles: this.manualObstacles,
      manualPowerZones: this.manualPowerZones
    });
  }
}
