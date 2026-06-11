import type { VisualEffect } from '../types/game';

export class EffectManager {
  private effects: VisualEffect[] = [];

  addEffect(effect: VisualEffect) {
    this.effects.push(effect);
  }

  update() {
    const now = Date.now();
    this.effects = this.effects.filter(e => now - e.startTime < e.duration);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const now = Date.now();
    this.effects.forEach(effect => {
      const elapsed = now - effect.startTime;
      const progress = elapsed / effect.duration;
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (effect.type === 'collision') {
        ctx.strokeStyle = '#F9FAFB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 5 + progress * 20, 0, Math.PI * 2);
        ctx.stroke();

        // Brief flash
        if (progress < 0.3) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 10 * (1 - progress * 3), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (effect.type === 'conversion') {
        ctx.shadowBlur = 15;
        ctx.shadowColor = effect.color || '#FFFFFF';
        ctx.fillStyle = effect.color || '#FFFFFF';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 15 * (1 + progress), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  clear() {
    this.effects = [];
  }
}
