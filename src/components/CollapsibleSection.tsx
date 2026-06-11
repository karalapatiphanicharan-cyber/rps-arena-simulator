import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: string;
  badge?: string | number;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon,
  badge
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`collapsible-section ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
      <button
        className="collapsible-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="header-left">
          {icon && <span className="section-icon">{icon}</span>}
          <span className="section-title-text">{title}</span>
          {badge !== undefined && <span className="section-badge">{badge}</span>}
        </div>
        <span className={`chevron ${isExpanded ? 'up' : 'down'}`}>
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      {isExpanded && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
