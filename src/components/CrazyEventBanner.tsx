import React, { useEffect, useState } from 'react';
import type { CrazyEvent } from '../types/game';

interface CrazyEventBannerProps {
  event: CrazyEvent | null;
}

const CrazyEventBanner: React.FC<CrazyEventBannerProps> = ({ event }) => {
  const [visibleEvent, setVisibleEvent] = useState<CrazyEvent | null>(null);

  useEffect(() => {
      if (event) {
          setVisibleEvent(event);
          const timer = setTimeout(() => {
              setVisibleEvent(null);
          }, 3000);
          return () => clearTimeout(timer);
      }
  }, [event]);

  if (!visibleEvent) return null;

  return (
    <div className="crazy-event-banner-container-fixed">
      <div
        className="crazy-event-banner animate-slide-down-event"
        style={{
          background: visibleEvent.color,
          boxShadow: `0 0 20px ${visibleEvent.color}88`
        }}
      >
        <span className="event-icon">{visibleEvent.icon}</span>
        <span className="event-name">{visibleEvent.name.toUpperCase()} ACTIVATED</span>
      </div>

      <style>{`
        .crazy-event-banner-container-fixed {
            display: flex;
            justify-content: center;
            pointer-events: none;
            z-index: 10;
            margin-bottom: 1rem;
            width: 100%;
        }
        .crazy-event-banner {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.5rem 1.5rem;
            border-radius: 2rem;
            color: #0F172A;
            font-weight: 800;
            font-size: 1rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .animate-slide-down-event {
            animation: slideDownEvent 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                       fadeOutEvent 0.5s ease-in 2.5s forwards;
        }
        @keyframes slideDownEvent {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOutEvent {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default CrazyEventBanner;
