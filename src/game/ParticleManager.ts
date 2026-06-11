export class ParticleManager {
  private particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.init();
  }

  private init() {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5
      });
    }
  }

  update(speedMultiplier: number = 1) {
    this.particles.forEach(p => {
      p.x += p.vx * speedMultiplier;
      p.y += p.vy * speedMultiplier;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}
