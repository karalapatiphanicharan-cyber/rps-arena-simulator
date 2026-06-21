import React from 'react';
import type { EntityType } from '../types/game';
import { getEmoji } from '../game/Rules';

interface TypeIconProps {
  type: EntityType;
  size?: number;
  className?: string;
}

const TypeIcon: React.FC<TypeIconProps> = ({ type, size = 20, className = '' }) => {
  if (!type) return null;

  if (type === 'rock') {
    return (
      <span className={className} style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        verticalAlign: 'middle',
        position: 'relative'
      }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <radialGradient id="rockGradient" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
              <stop offset="0%" stopColor="#9CA3AF" />
              <stop offset="40%" stopColor="#6B7280" />
              <stop offset="100%" stopColor="#4B5563" />
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="11" fill="url(#rockGradient)" stroke="#111827" strokeWidth="1.5" />
          <circle cx="9.5" cy="9.5" r="7" fill="white" fillOpacity="0.05" />
        </svg>
        <span style={{
            fontSize: `${size * 0.8}px`,
            zIndex: 1,
            position: 'relative',
            marginTop: '2px'
        }}>
            {getEmoji('rock')}
        </span>
      </span>
    );
  }

  return (
    <span className={className} style={{ fontSize: `${size}px`, verticalAlign: 'middle' }}>
      {getEmoji(type)}
    </span>
  );
};

export default TypeIcon;
