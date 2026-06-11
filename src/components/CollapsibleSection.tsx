import React, { useState, useEffect } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  icon?: string;
  badge?: string | number;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  expanded,
  onToggle,
  icon,
  badge
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  useEffect(() => {
      if (expanded !== undefined) {
          setInternalExpanded(expanded);
      }
  }, [expanded]);

  const isExpanded = expanded !== undefined ? expanded : internalExpanded;

  const handleToggle = () => {
      const newState = !isExpanded;
      if (onToggle) {
          onToggle(newState);
      } else {
          setInternalExpanded(newState);
      }
  };

  return (
    <div className={`collapsible-section ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
      <button
        className="collapsible-header"
        onClick={handleToggle}
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
      <div className={`collapsible-content-wrapper ${isExpanded ? 'open' : 'closed'}`}>
        <div className="collapsible-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
