import React, { useEffect, useState } from 'react';

interface CountDisplayProps {
  count: number;
  className?: string;
}

const CountDisplay: React.FC<CountDisplayProps> = ({ count, className = '' }) => {
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    setIsPopping(true);
    const timer = setTimeout(() => setIsPopping(false), 180);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <span className={`${className} ${isPopping ? 'count-pop' : ''}`}>
      {count}
    </span>
  );
};

export default CountDisplay;
