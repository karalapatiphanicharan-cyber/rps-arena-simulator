import React from 'react';
import type { CrazyEvent } from '../types/game';

interface CrazyEventBannerProps {
  event: CrazyEvent | null;
}

const CrazyEventBanner: React.FC<CrazyEventBannerProps> = ({ event }) => {
  if (!event) return null;

  return (
    <div className="crazy-event-banner-container">
      <div
        className="crazy-event-banner animate-slide-down"
        style={{
          background: event.color,
          boxShadow: `0 0 20px ${event.color}88`
        }}
      >
        <span className="event-icon">{event.icon}</span>
        <span className="event-name">{event.name.toUpperCase()} ACTIVATED</span>
      </div>

      <style>{`
        .crazy-event-banner-container {
            position: absolute;
            top: 1rem;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            pointer-events: none;
            z-index: 10;
        }
        .crazy-event-banner {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 2rem;
            border-radius: 2rem;
            color: #0F172A;
            font-weight: 800;
            font-size: 1.25rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .animate-slide-down {
            animation: slideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CrazyEventBanner;
